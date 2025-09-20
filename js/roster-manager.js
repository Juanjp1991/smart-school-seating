// Roster Manager functionality
class RosterManager {
    constructor() {
        this.currentEditingId = null;
    }

    loadRosterList() {
        const rosters = StorageService.getAllRosters();
        const rosterList = document.getElementById('roster-list');
        
        if (!rosterList) return;

        if (rosters.length === 0) {
            rosterList.innerHTML = `
                <div style="text-align: center; padding: 3rem 0;">
                    <p style="color: #6b7280; font-size: 1.125rem;">${t('rosters.empty.title')}</p>
                    <p style="color: #9ca3af; font-size: 0.875rem; margin-top: 0.5rem;">${t('rosters.empty.subtitle')}</p>
                </div>
            `;
            applyTranslations();
            return;
        }

        rosterList.innerHTML = rosters.map(roster => {
            const studentCount = roster.students ? roster.students.length : 0;
            const studentCountText = t('roster.studentCount', { count: studentCount });
            const previewIntro = t('roster.previewPrefix');
            const previewMore = studentCount > 3 ? t('roster.previewMore', { count: studentCount - 3 }) : '';
            return `
                <div class="roster-item">
                    <div class="roster-item-header">
                        <div>
                            <h3 class="roster-item-title">${roster.name}</h3>
                            <p class="roster-item-count">${studentCountText}</p>
                        </div>
                        <div class="roster-item-actions">
                            <button onclick="editRoster('${roster.id}')" title="${t('roster.actions.edit')}">${t('roster.actions.edit')}</button>
                            <button onclick="viewRoster('${roster.id}')" class="button-primary" title="${t('roster.actions.view')}">${t('roster.actions.view')}</button>
                            <button onclick="deleteRoster('${roster.id}')" class="button-danger" title="${t('roster.actions.delete')}">${t('roster.actions.delete')}</button>
                        </div>
                    </div>
                    ${studentCount > 0 ? `
                        <div class="roster-preview" style="margin-top: 1rem;">
                            <p style="font-size: 0.875rem; color: #6b7280;">
                                ${previewIntro} ${roster.students.slice(0, 3).join(', ')}${previewMore ? ` ${previewMore}` : ''}
                            </p>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        applyTranslations();
    }

    openCreateRosterModal() {
        this.currentEditingId = null;
        document.getElementById('roster-modal-title').textContent = t('modals.roster.titleCreate');
        document.getElementById('roster-name').value = '';
        document.getElementById('student-input').value = '';
        document.getElementById('roster-error').style.display = 'none';
        document.getElementById('roster-modal').style.display = 'flex';
        document.getElementById('roster-name').focus();
        applyTranslations();
    }

    openEditRosterModal(rosterId) {
        const roster = StorageService.getRosterById(rosterId);
        if (!roster) return;

        this.currentEditingId = rosterId;
        document.getElementById('roster-modal-title').textContent = t('modals.roster.titleEdit');
        document.getElementById('roster-name').value = roster.name;
        document.getElementById('student-input').value = (roster.students || []).join('\n');
        document.getElementById('roster-error').style.display = 'none';
        document.getElementById('roster-modal').style.display = 'flex';
        document.getElementById('roster-name').focus();
        applyTranslations();
    }

    closeRosterModal() {
        document.getElementById('roster-modal').style.display = 'none';
        this.currentEditingId = null;
    }

    saveRoster() {
        const name = document.getElementById('roster-name').value.trim();
        const studentInput = document.getElementById('student-input').value.trim();
        const errorEl = document.getElementById('roster-error');

        // Validate input
        if (!name) {
            errorEl.textContent = t('notifications.error.rosterNameRequired');
            errorEl.style.display = 'block';
            return;
        }

        if (!studentInput) {
            errorEl.textContent = t('notifications.error.rosterStudentRequired');
            errorEl.style.display = 'block';
            return;
        }

        // Parse students
        const students = studentInput
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        if (students.length === 0) {
            errorEl.textContent = t('notifications.error.rosterStudentRequired');
            errorEl.style.display = 'block';
            return;
        }

        // Check for duplicate name (except when editing same roster)
        const existingRoster = StorageService.getRosterByName(name);
        if (existingRoster && existingRoster.id !== this.currentEditingId) {
            errorEl.textContent = t('notifications.error.rosterExists');
            errorEl.style.display = 'block';
            return;
        }

        try {
            const rosterData = { name, students };

            if (this.currentEditingId) {
                // Update existing roster
                StorageService.updateRoster(this.currentEditingId, rosterData);
                showNotification(t('notifications.success.rosterUpdated', { name }), 'success');
            } else {
                // Create new roster
                StorageService.saveRoster(rosterData);
                showNotification(t('notifications.success.rosterCreated', { name }), 'success');
            }

            // Update dropdown in plan editor if present
            if (app) {
                app.populateRosterSelect();
            }

            this.closeRosterModal();
            this.loadRosterList();

        } catch (error) {
            console.error('Failed to save roster:', error);
            errorEl.textContent = t('notifications.error.rosterSaveFailed');
            errorEl.style.display = 'block';
        }
    }

    deleteRoster(rosterId) {
        const roster = StorageService.getRosterById(rosterId);
        if (!roster) return;

        if (confirm(t('prompts.rosterDelete', { name: roster.name }))) {
            try {
                StorageService.deleteRoster(rosterId);
                showNotification(t('notifications.success.rosterDeleted', { name: roster.name }), 'success');

                // Update dropdown in plan editor if present
                if (app) {
                    app.populateRosterSelect();
                }

                this.loadRosterList();
            } catch (error) {
                console.error('Failed to delete roster:', error);
                showNotification(t('notifications.error.rosterDeleteFailed'), 'error');
            }
        }
    }

    viewRoster(rosterId) {
        const roster = StorageService.getRosterById(rosterId);
        if (!roster) return;

        const students = roster.students || [];
        const studentList = students.length > 0
            ? students.map((student, index) => `${index + 1}. ${student}`).join('\n')
            : t('notifications.error.rosterViewEmpty');

        alert(`${roster.name}\n\n${studentList}`);
    }

    // CSV Import functionality
    openImportCsvModal() {
        document.getElementById('roster-name-csv').value = '';
        document.getElementById('csv-file-input').value = '';
        document.getElementById('csv-preview').innerHTML = `<span data-i18n="modals.importCsv.previewPlaceholder">${t('modals.importCsv.previewPlaceholder')}</span>`;
        document.getElementById('import-csv-error').style.display = 'none';
        document.getElementById('import-csv-modal').style.display = 'flex';

        // Add file change listener
        const fileInput = document.getElementById('csv-file-input');
        fileInput.onchange = (e) => this.previewCsvFile(e.target.files[0]);

        applyTranslations();
    }

    closeImportCsvModal() {
        document.getElementById('import-csv-modal').style.display = 'none';
        // Remove event listener
        const fileInput = document.getElementById('csv-file-input');
        fileInput.onchange = null;
    }

    previewCsvFile(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvText = e.target.result;
                const lines = csvText.trim().split('\n');
                
                if (lines.length < 2) {
                    document.getElementById('csv-preview').innerHTML =
                        `<span style="color: red;">${t('tables.csv.headerError')}</span>`;
                    return;
                }
                
                // Parse header
                const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                
                // Check for required 'name' column
                const nameIndex = headers.findIndex(h => h.toLowerCase() === 'name');
                if (nameIndex === -1) {
                    document.getElementById('csv-preview').innerHTML =
                        `<span style="color: red;">${t('tables.csv.nameError')}</span>`;
                    return;
                }
                
                // Preview first few rows
                const previewLines = lines.slice(0, Math.min(6, lines.length));
                let preview = '<table style="width: 100%; border-collapse: collapse;">';
                
                // Header row
                preview += '<tr style="background: #f3f4f6; border-bottom: 1px solid #d1d5db;">';
                headers.forEach(header => {
                    preview += `<th style="padding: 8px; text-align: left; font-weight: 600;">${header}</th>`;
                });
                preview += '</tr>';
                
                // Data rows
                for (let i = 1; i < previewLines.length; i++) {
                    const cells = previewLines[i].split(',').map(c => c.trim().replace(/"/g, ''));
                    preview += '<tr style="border-bottom: 1px solid #e5e7eb;">';
                    cells.forEach((cell, idx) => {
                        const isNameColumn = idx === nameIndex;
                        preview += `<td style="padding: 8px; ${isNameColumn ? 'font-weight: 600; color: #1f2937;' : 'color: #6b7280;'}">${cell || '-'}</td>`;
                    });
                    preview += '</tr>';
                }
                
                if (lines.length > 6) {
                    preview += `<tr><td colspan="${headers.length}" style="padding: 8px; text-align: center; color: #6b7280; font-style: italic;">${t('tables.csv.footerMoreRows', { count: lines.length - 6 })}</td></tr>`;
                }

                preview += '</table>';
                preview += `<p style="margin-top: 12px; color: #059669; font-size: 0.875rem;">${t('tables.csv.foundStudents', { count: lines.length - 1 })}</p>`;

                document.getElementById('csv-preview').innerHTML = preview;

            } catch (error) {
                document.getElementById('csv-preview').innerHTML =
                    `<span style="color: red;">${t('tables.csv.readError')}</span>`;
            }
        };
        
        reader.readAsText(file);
    }

    importCsvRoster() {
        const name = document.getElementById('roster-name-csv').value.trim();
        const fileInput = document.getElementById('csv-file-input');
        const file = fileInput.files[0];
        const errorEl = document.getElementById('import-csv-error');

        if (!name) {
            errorEl.textContent = t('notifications.error.csvNameRequired');
            errorEl.style.display = 'block';
            return;
        }

        if (!file) {
            errorEl.textContent = t('notifications.error.csvFileRequired');
            errorEl.style.display = 'block';
            return;
        }

        // Check for duplicate name
        const existingRoster = StorageService.getRosterByName(name);
        if (existingRoster) {
            errorEl.textContent = t('notifications.error.csvDuplicateName');
            errorEl.style.display = 'block';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvText = e.target.result;
                const lines = csvText.trim().split('\n');
                
                if (lines.length < 2) {
                    errorEl.textContent = t('notifications.error.csvStructure');
                    errorEl.style.display = 'block';
                    return;
                }
                
                // Parse header and find name column
                const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
                const nameIndex = headers.indexOf('name');
                
                if (nameIndex === -1) {
                    errorEl.textContent = t('notifications.error.csvMissingName');
                    errorEl.style.display = 'block';
                    return;
                }
                
                // Extract student names
                const students = [];
                for (let i = 1; i < lines.length; i++) {
                    const cells = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
                    const studentName = cells[nameIndex];
                    if (studentName && studentName.trim()) {
                        students.push(studentName.trim());
                    }
                }
                
                if (students.length === 0) {
                    errorEl.textContent = t('notifications.error.csvNoStudents');
                    errorEl.style.display = 'block';
                    return;
                }
                
                // Save roster
                const rosterData = { name, students };
                StorageService.saveRoster(rosterData);
                
                // Update dropdown in plan editor if present
                if (app) {
                    app.populateRosterSelect();
                }
                
                showNotification(t('notifications.success.rosterImported', { name, count: students.length }), 'success');
                this.closeImportCsvModal();
                this.loadRosterList();

            } catch (error) {
                console.error('Failed to import CSV:', error);
                errorEl.textContent = t('notifications.error.csvImportFailed');
                errorEl.style.display = 'block';
            }
        };
        
        reader.readAsText(file);
    }

    // Seating Rules functionality
    openSeatingRulesModal() {
        // Load current rules from storage or use defaults
        const rules = StorageService.getSeatingRules() || this.getDefaultSeatingRules();
        
        // Set checkbox states
        document.getElementById('rule-random').checked = rules.randomSeating;
        document.getElementById('rule-avoid-front').checked = rules.avoidFrontRow;
        document.getElementById('rule-separate-disruptive').checked = rules.separateDisruptive;
        document.getElementById('rule-teacher-proximity').checked = rules.teacherProximity;
        
        // Set numeric values
        document.getElementById('max-group-size').value = rules.maxGroupSize;
        document.getElementById('min-distance').value = rules.minDistance;
        
        // Populate student dropdown
        this.populateStudentSelect();
        
        // Display current student rules
        this.displayCurrentStudentRules();
        
        document.getElementById('seating-rules-error').style.display = 'none';
        document.getElementById('seating-rules-modal').style.display = 'flex';
    }

    populateStudentSelect() {
        const select = document.getElementById('student-select');
        const rosters = StorageService.getAllRosters();

        // Get all unique students from all rosters
        const allStudents = new Set();
        rosters.forEach(roster => {
            if (roster.students) {
                roster.students.forEach(student => {
                    allStudents.add(student.trim());
                });
            }
        });

        // Populate dropdown
        select.innerHTML = '';

        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.dataset.i18n = 'modals.seatingRules.selectStudentPlaceholder';
        placeholderOption.textContent = t('modals.seatingRules.selectStudentPlaceholder');
        select.appendChild(placeholderOption);

        Array.from(allStudents).sort().forEach(student => {
            const option = document.createElement('option');
            option.value = student;
            option.textContent = student;
            select.appendChild(option);
        });

        applyTranslations();
    }

    displayCurrentStudentRules() {
        const container = document.getElementById('current-student-rules');
        const allRules = StorageService.getAllStudentRules();
        
        if (Object.keys(allRules).length === 0) {
            container.innerHTML = `<p class="text-gray-500 text-sm">${t('modals.seatingRules.currentRulesEmpty')}</p>`;
            return;
        }

        let html = '';
        Object.entries(allRules).forEach(([studentName, rules]) => {
            const ruleDescriptions = [];
            if (rules.visionNeeds) ruleDescriptions.push(t('modals.seatingRules.studentDescriptions.vision'));
            if (rules.behavioral) ruleDescriptions.push(t('modals.seatingRules.studentDescriptions.behavior'));
            if (rules.needsAttention) ruleDescriptions.push(t('modals.seatingRules.studentDescriptions.attention'));
            if (rules.prefersGroup) ruleDescriptions.push(t('modals.seatingRules.studentDescriptions.group'));

            html += `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                        <span class="font-medium text-gray-900">${studentName}</span>
                        <div class="text-sm text-gray-600">
                            ${ruleDescriptions.length > 0 ? ruleDescriptions.join(', ') : t('modals.seatingRules.studentDescriptions.none')}
                        </div>
                    </div>
                    <button onclick="removeStudentRules('${studentName}')" class="text-red-600 hover:text-red-800 text-sm">
                        ${t('modals.seatingRules.remove')}
                    </button>
                </div>
            `;
        });

        container.innerHTML = html;
        applyTranslations();
    }

    closeSeatingRulesModal() {
        document.getElementById('seating-rules-modal').style.display = 'none';
    }

    getDefaultSeatingRules() {
        return {
            randomSeating: true,
            avoidFrontRow: false,
            separateDisruptive: true,
            teacherProximity: true,
            maxGroupSize: 4,
            minDistance: 2
        };
    }

    resetSeatingRules() {
        const defaults = this.getDefaultSeatingRules();
        
        document.getElementById('rule-random').checked = defaults.randomSeating;
        document.getElementById('rule-avoid-front').checked = defaults.avoidFrontRow;
        document.getElementById('rule-separate-disruptive').checked = defaults.separateDisruptive;
        document.getElementById('rule-teacher-proximity').checked = defaults.teacherProximity;
        document.getElementById('max-group-size').value = defaults.maxGroupSize;
        document.getElementById('min-distance').value = defaults.minDistance;
    }

    saveSeatingRules() {
        try {
            const rules = {
                randomSeating: document.getElementById('rule-random').checked,
                avoidFrontRow: document.getElementById('rule-avoid-front').checked,
                separateDisruptive: document.getElementById('rule-separate-disruptive').checked,
                teacherProximity: document.getElementById('rule-teacher-proximity').checked,
                maxGroupSize: parseInt(document.getElementById('max-group-size').value) || 4,
                minDistance: parseInt(document.getElementById('min-distance').value) || 2
            };
            
            StorageService.saveSeatingRules(rules);
            showNotification(t('notifications.success.seatingRulesSaved'), 'success');
            this.closeSeatingRulesModal();

        } catch (error) {
            console.error('Failed to save seating rules:', error);
            document.getElementById('seating-rules-error').textContent = t('notifications.error.seatingRulesSaveFailed');
            document.getElementById('seating-rules-error').style.display = 'block';
        }
    }

    loadStudentRules() {
        const studentName = document.getElementById('student-select').value;
        const container = document.getElementById('student-rules-container');
        const nameSpan = document.getElementById('selected-student-name');
        
        if (!studentName) {
            container.style.display = 'none';
            return;
        }
        
        // Load existing rules for this student
        const rules = StorageService.getStudentRules(studentName) || {
            visionNeeds: false,
            behavioral: false,
            needsAttention: false,
            prefersGroup: false
        };
        
        // Set checkbox states
        document.getElementById('student-rule-vision').checked = rules.visionNeeds || false;
        document.getElementById('student-rule-behavior').checked = rules.behavioral || false;
        document.getElementById('student-rule-attention').checked = rules.needsAttention || false;
        document.getElementById('student-rule-group').checked = rules.prefersGroup || false;
        
        // Update display
        nameSpan.textContent = studentName;
        container.style.display = 'block';
    }

    saveStudentRules() {
        const studentName = document.getElementById('student-select').value;
        if (!studentName) {
            showNotification(t('notifications.error.studentSelectionRequired'), 'error');
            return;
        }
        
        try {
            const rules = {
                visionNeeds: document.getElementById('student-rule-vision').checked,
                behavioral: document.getElementById('student-rule-behavior').checked,
                needsAttention: document.getElementById('student-rule-attention').checked,
                prefersGroup: document.getElementById('student-rule-group').checked
            };
            
            StorageService.saveStudentRules(studentName, rules);
            this.displayCurrentStudentRules();
            showNotification(t('notifications.success.studentRulesSaved', { name: studentName }), 'success');

        } catch (error) {
            console.error('Failed to save student rules:', error);
            showNotification(t('notifications.error.studentRulesSaveFailed'), 'error');
        }
    }

    removeStudentRules(studentName) {
        if (confirm(t('prompts.removeStudentRules', { name: studentName }))) {
            try {
                StorageService.deleteStudentRules(studentName);
                this.displayCurrentStudentRules();
                showNotification(t('notifications.success.studentRulesRemoved', { name: studentName }), 'success');
            } catch (error) {
                console.error('Failed to remove student rules:', error);
                showNotification(t('notifications.error.studentRulesRemoveFailed'), 'error');
            }
        }
    }
}

// Global functions for roster management
function showCreateRosterModal() {
    if (window.rosterManager) {
        rosterManager.openCreateRosterModal();
    }
}

function editRoster(rosterId) {
    if (window.rosterManager) {
        rosterManager.openEditRosterModal(rosterId);
    }
}

function viewRoster(rosterId) {
    if (window.rosterManager) {
        rosterManager.viewRoster(rosterId);
    }
}

function deleteRoster(rosterId) {
    if (window.rosterManager) {
        rosterManager.deleteRoster(rosterId);
    }
}

function closeRosterModal() {
    if (window.rosterManager) {
        rosterManager.closeRosterModal();
    }
}

function saveRoster() {
    if (window.rosterManager) {
        rosterManager.saveRoster();
    }
}

// CSV Import functions
function showImportCsvModal() {
    if (window.rosterManager) {
        rosterManager.openImportCsvModal();
    }
}

function closeImportCsvModal() {
    if (window.rosterManager) {
        rosterManager.closeImportCsvModal();
    }
}

function importCsvRoster() {
    if (window.rosterManager) {
        rosterManager.importCsvRoster();
    }
}

// Seating Rules functions
function showSeatingRulesModal() {
    if (window.rosterManager) {
        rosterManager.openSeatingRulesModal();
    } else {
        // Fallback: create roster manager if it doesn't exist
        window.rosterManager = new RosterManager();
        rosterManager.openSeatingRulesModal();
    }
}

function closeSeatingRulesModal() {
    if (window.rosterManager) {
        rosterManager.closeSeatingRulesModal();
    }
}

function resetSeatingRules() {
    if (window.rosterManager) {
        rosterManager.resetSeatingRules();
    }
}

function saveSeatingRules() {
    if (window.rosterManager) {
        rosterManager.saveSeatingRules();
    }
}

function loadStudentRules() {
    if (window.rosterManager) {
        rosterManager.loadStudentRules();
    }
}

function saveStudentRules() {
    if (window.rosterManager) {
        rosterManager.saveStudentRules();
    }
}

function removeStudentRules(studentName) {
    if (window.rosterManager) {
        rosterManager.removeStudentRules(studentName);
    }
}

// Initialize roster manager when script loads
document.addEventListener('DOMContentLoaded', () => {
    window.rosterManager = new RosterManager();
});

document.addEventListener('languagechange', () => {
    if (window.rosterManager) {
        rosterManager.loadRosterList();
        rosterManager.populateStudentSelect();
        rosterManager.displayCurrentStudentRules();

        const rosterModalTitle = document.getElementById('roster-modal-title');
        if (rosterModalTitle) {
            rosterModalTitle.textContent = rosterManager.currentEditingId
                ? t('modals.roster.titleEdit')
                : t('modals.roster.titleCreate');
        }

        const csvPreview = document.getElementById('csv-preview');
        if (csvPreview && csvPreview.childElementCount === 1) {
            const child = csvPreview.firstElementChild;
            if (child && child.dataset && child.dataset.i18n === 'modals.importCsv.previewPlaceholder') {
                applyTranslations();
            }
        }

        applyTranslations();
    }
});
