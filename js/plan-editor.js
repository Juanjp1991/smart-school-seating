// Plan Editor functionality
class PlanEditor {
    constructor() {
        this.selectedLayout = null;
        this.selectedRoster = null;
        this.currentSeatingPlan = null;
        this.assignments = new Map(); // seat position -> student name
    }

    initialize() {
        // Reset selections when entering plan editor
        document.getElementById('layout-select').value = '';
        document.getElementById('roster-select').value = '';
        this.selectedLayout = null;
        this.selectedRoster = null;
        this.currentSeatingPlan = null;

        // Populate dropdowns with current data
        this.populateLayoutSelect();
        this.populateRosterSelect();

        this.updateContent();
    }

    populateLayoutSelect() {
        const layouts = StorageService.getAllLayouts();
        const select = document.getElementById('layout-select');
        if (select) {
            select.innerHTML = '';

            const placeholderOption = document.createElement('option');
            placeholderOption.value = '';
            placeholderOption.dataset.i18n = 'plan.controls.layoutPlaceholder';
            placeholderOption.textContent = t('plan.controls.layoutPlaceholder');
            select.appendChild(placeholderOption);

            layouts.forEach(layout => {
                const option = document.createElement('option');
                option.value = layout.id;
                option.textContent = layout.name;
                select.appendChild(option);
            });

            applyTranslations();
        }
    }

    populateRosterSelect() {
        const rosters = StorageService.getAllRosters();
        const select = document.getElementById('roster-select');
        if (select) {
            select.innerHTML = '';

            const placeholderOption = document.createElement('option');
            placeholderOption.value = '';
            placeholderOption.dataset.i18n = 'plan.controls.rosterPlaceholder';
            placeholderOption.textContent = t('plan.controls.rosterPlaceholder');
            select.appendChild(placeholderOption);

            rosters.forEach(roster => {
                const option = document.createElement('option');
                option.value = roster.id;
                option.textContent = roster.name;
                select.appendChild(option);
            });

            applyTranslations();
        }
    }

    loadLayoutForPlan() {
        const layoutSelect = document.getElementById('layout-select');
        const layoutId = layoutSelect.value;
        
        if (layoutId) {
            this.selectedLayout = StorageService.getLayoutById(layoutId);
            this.updateContent();
        } else {
            this.selectedLayout = null;
            this.updateContent();
        }
    }

    loadRosterForPlan() {
        const rosterSelect = document.getElementById('roster-select');
        const rosterId = rosterSelect.value;
        
        if (rosterId) {
            this.selectedRoster = StorageService.getRosterById(rosterId);
            this.updateContent();
        } else {
            this.selectedRoster = null;
            this.updateContent();
        }
    }

    generateSeatingPlan() {
        if (!this.selectedLayout || !this.selectedRoster) {
            showNotification(t('notifications.error.seatingPlanRequirements'), 'error');
            return;
        }

        const seats = this.selectedLayout.seats || [];
        const students = this.selectedRoster.students || [];

        if (seats.length === 0) {
            showNotification(t('notifications.error.seatingPlanNoSeats'), 'error');
            return;
        }

        if (students.length === 0) {
            showNotification(t('notifications.error.seatingPlanNoStudents'), 'error');
            return;
        }

        if (students.length > seats.length) {
            showNotification(t('notifications.error.seatingPlanNotEnoughSeats', {
                seats: seats.length,
                students: students.length
            }), 'error');
            return;
        }

        // Generate random seating arrangement
        this.assignments.clear();
        const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
        const shuffledSeats = [...seats].sort(() => Math.random() - 0.5);

        shuffledStudents.forEach((student, index) => {
            this.assignments.set(shuffledSeats[index], student);
        });

        this.currentSeatingPlan = {
            layoutId: this.selectedLayout.id,
            rosterId: this.selectedRoster.id,
            assignments: Object.fromEntries(this.assignments),
            generatedAt: Date.now()
        };

        this.renderSeatingPlan();
        showNotification(t('notifications.success.seatingPlanGenerated'), 'success');
    }

    renderSeatingPlan() {
        const content = document.getElementById('seating-plan-content');

        if (!this.currentSeatingPlan) {
            content.innerHTML = `<p style="color: #6b7280;">${t('plan.empty.selectBoth')}</p>`;
            return;
        }

        const layout = this.selectedLayout;
        const roster = this.selectedRoster;
        const locale = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en';
        const generatedTimestamp = new Date(this.currentSeatingPlan.generatedAt).toLocaleString(
            locale === 'nl' ? 'nl-NL' : undefined
        );
        const summaryText = t('planEditor.summary', {
            layout: layout.name,
            roster: roster.name,
            generated: generatedTimestamp
        });

        // Calculate grid dimensions
        const cellSize = 120;
        const gap = 16;

        content.innerHTML = `
            <div style="margin-bottom: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <div>
                        <h3 style="font-size: 1.125rem; font-weight: 600;">${t('planEditor.seatingPlanTitle')}</h3>
                        <p style="font-size: 0.875rem; color: #6b7280;">
                            ${summaryText}
                        </p>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button onclick="regenerateSeatingPlan()" class="button-secondary">${t('plan.actions.regenerate')}</button>
                        <button onclick="saveSeatingPlan()" class="button-primary">${t('plan.actions.save')}</button>
                    </div>
                </div>
            </div>
            <div class="seating-plan-container" style="display: flex; justify-content: center; overflow: auto;">
                <div id="seating-grid" class="seating-grid" style="
                    display: grid; 
                    grid-template-columns: repeat(${layout.grid_cols}, ${cellSize}px);
                    grid-template-rows: repeat(${layout.grid_rows}, ${cellSize}px);
                    gap: ${gap}px;
                    padding: 20px;
                    border: 2px solid #333;
                    border-radius: 8px;
                    background-color: white;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                "></div>
            </div>
        `;

        this.renderGrid();
    }

    renderGrid() {
        const gridContainer = document.getElementById('seating-grid');
        if (!gridContainer) return;

        const layout = this.selectedLayout;
        gridContainer.innerHTML = '';

        // Create cells
        for (let row = 0; row < layout.grid_rows; row++) {
            for (let col = 0; col < layout.grid_cols; col++) {
                const cell = document.createElement('div');
                const seatKey = `${row}-${col}`;
                
                // Check if this position has furniture
                const hasFurniture = layout.furniture.some(item =>
                    item.positions.some(pos => pos.row === row && pos.col === col)
                );

                // Check if this position has a seat
                const hasSeat = layout.seats.includes(seatKey);

                // Get assigned student
                const assignedStudent = this.assignments.get(seatKey);

                cell.style.cssText = `
                    grid-row: ${row + 1};
                    grid-column: ${col + 1};
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: 500;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    padding: 8px;
                    word-break: break-word;
                    hyphens: auto;
                `;

                if (hasFurniture) {
                    // Render furniture
                    const furnitureItem = layout.furniture.find(item =>
                        item.positions.some(pos => pos.row === row && pos.col === col)
                    );
                    
                    if (furnitureItem.type === 'desk') {
                        cell.style.backgroundColor = '#8B4513';
                        cell.style.color = 'white';
                        cell.textContent = '🪑';
                        cell.style.fontSize = '24px';
                    } else if (furnitureItem.type === 'door') {
                        cell.style.backgroundColor = '#D2691E';
                        cell.style.color = 'white';
                        cell.textContent = '🚪';
                        cell.style.fontSize = '24px';
                    }
                } else if (hasSeat) {
                    // Render seat
                    if (assignedStudent) {
                        cell.className = 'student-card occupied';
                        cell.setAttribute('data-seat-key', seatKey);
                        cell.setAttribute('data-student', assignedStudent);

                        // Create student name span
                        const studentSpan = document.createElement('span');
                        studentSpan.className = 'student-name';
                        studentSpan.textContent = assignedStudent;
                        studentSpan.style.pointerEvents = 'none'; // Prevent span from interfering with drag
                        cell.appendChild(studentSpan);

                        // Make student draggable
                        cell.draggable = true;
                        cell.addEventListener('dragstart', (e) => this.handleDragStart(e, seatKey, assignedStudent));
                        cell.addEventListener('dragover', (e) => this.handleDragOver(e));
                        cell.addEventListener('drop', (e) => this.handleDrop(e, seatKey));
                        cell.addEventListener('dragend', (e) => this.handleDragEnd(e));
                        cell.addEventListener('dragleave', (e) => this.handleDragLeave(e));

                        cell.addEventListener('click', () => this.handleSeatClick(seatKey));
                    } else {
                        cell.className = 'student-card';
                        cell.setAttribute('data-seat-key', seatKey);

                        // Create empty seat span
                        const emptySpan = document.createElement('span');
                        emptySpan.className = 'empty-seat';
                        emptySpan.textContent = t('planEditor.emptySeat');
                        emptySpan.style.pointerEvents = 'none';
                        cell.appendChild(emptySpan);

                        // Make empty seat a drop target
                        cell.addEventListener('dragover', (e) => this.handleDragOver(e));
                        cell.addEventListener('drop', (e) => this.handleDrop(e, seatKey));
                        cell.addEventListener('dragleave', (e) => this.handleDragLeave(e));

                        cell.addEventListener('click', () => this.handleSeatClick(seatKey));
                    }
                } else {
                    // Empty grid cell
                    cell.style.backgroundColor = '#f9f9f9';
                    cell.style.border = '1px solid #ddd';
                    cell.style.cursor = 'default';
                }

                gridContainer.appendChild(cell);
            }
        }
    }

    handleDragStart(e, seatKey, student) {
        console.log('Drag start:', student, 'from', seatKey);

        // Set up drag data
        this.dragData = {
            fromSeat: seatKey,
            student: student
        };

        // Set up data transfer
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', student);
        e.dataTransfer.setData('application/json', JSON.stringify(this.dragData));

        // Add visual feedback
        e.target.classList.add('dragging');

        // Don't prevent default or stop propagation for dragstart
        console.log('Drag data set:', this.dragData);
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';

        // Add visual feedback for valid drop target
        if (e.currentTarget.classList.contains('student-card')) {
            e.currentTarget.classList.add('drag-over');
        }
    }

    handleDrop(e, toSeatKey) {
        e.preventDefault();
        e.stopPropagation();

        console.log('Drop event on seat:', toSeatKey);

        // Remove visual feedback
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));

        // Try to get drag data from either instance variable or dataTransfer
        let dragData = this.dragData;

        if (!dragData) {
            try {
                const transferData = e.dataTransfer.getData('application/json');
                if (transferData) {
                    dragData = JSON.parse(transferData);
                    console.log('Recovered drag data from dataTransfer:', dragData);
                }
            } catch (err) {
                console.log('Could not parse drag data from dataTransfer');
            }
        }

        if (!dragData) {
            console.log('No drag data available from any source');
            return;
        }

        if (dragData.fromSeat === toSeatKey) {
            console.log('Dropped on same seat, ignoring');
            return;
        }

        const fromSeatKey = dragData.fromSeat;
        const draggedStudent = dragData.student;
        const targetStudent = this.assignments.get(toSeatKey);

        console.log('Moving', draggedStudent, 'from', fromSeatKey, 'to', toSeatKey);

        if (targetStudent) {
            // Swap students
            this.assignments.set(fromSeatKey, targetStudent);
            this.assignments.set(toSeatKey, draggedStudent);
            console.log('Swapped students');
            showNotification(t('notifications.success.swapStudents', {
                first: draggedStudent,
                second: targetStudent
            }), 'success');
        } else {
            // Move student to empty seat
            this.assignments.delete(fromSeatKey);
            this.assignments.set(toSeatKey, draggedStudent);
            console.log('Moved to empty seat');
            showNotification(t('notifications.success.moveToSeat', { student: draggedStudent }), 'success');
        }

        // Update current seating plan
        this.currentSeatingPlan.assignments = Object.fromEntries(this.assignments);
        this.renderGrid();
        applyTranslations();
    }

    handleDragLeave(e) {
        // Only remove drag-over if we're truly leaving the element (not just moving to a child)
        if (!e.currentTarget.contains(e.relatedTarget)) {
            e.currentTarget.classList.remove('drag-over');
        }
    }

    handleDragEnd(e) {
        console.log('Drag end');
        // Clean up drag state
        e.target.classList.remove('dragging');
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        this.dragData = null;
    }

    handleSeatClick(seatKey) {
        if (!this.currentSeatingPlan) return;

        const currentStudent = this.assignments.get(seatKey);
        const availableStudents = this.selectedRoster.students.filter(student =>
            !Array.from(this.assignments.values()).includes(student) || student === currentStudent
        );

        if (availableStudents.length === 0 && !currentStudent) {
            showNotification(t('notifications.info.allStudentsAssigned'), 'info');
            return;
        }

        // Create a simple prompt for student selection
        let options = [t('prompts.seatOptions.remove')];
        if (currentStudent) {
            options.push(t('prompts.seatOptions.keep', { name: currentStudent }));
        }
        options.push(...availableStudents.filter(s => s !== currentStudent));

        const currentLabel = currentStudent || t('planEditor.emptySeat');
        const promptMessage = t('prompts.seatAssignment', { current: currentLabel }) +
            options.map((option, index) => `${index}: ${option}`).join('\n');

        const choice = prompt(promptMessage, '0');

        const choiceIndex = parseInt(choice);
        if (isNaN(choiceIndex) || choiceIndex < 0 || choiceIndex >= options.length) {
            return;
        }

        if (choiceIndex === 0) {
            // Remove student
            this.assignments.delete(seatKey);
        } else if (choiceIndex === 1 && currentStudent) {
            // Keep current student (do nothing)
            return;
        } else {
            // Assign new student
            const studentIndex = currentStudent ? choiceIndex - 2 : choiceIndex - 1;
            const selectedStudent = availableStudents[studentIndex];
            if (selectedStudent) {
                // Remove student from any existing assignment
                for (const [key, value] of this.assignments.entries()) {
                    if (value === selectedStudent) {
                        this.assignments.delete(key);
                    }
                }
                // Assign to new seat
                this.assignments.set(seatKey, selectedStudent);
            }
        }

        // Update current seating plan
        this.currentSeatingPlan.assignments = Object.fromEntries(this.assignments);
        this.renderGrid();
    }

    regenerateSeatingPlan() {
        if (this.selectedLayout && this.selectedRoster) {
            this.generateSeatingPlan();
        }
    }

    saveCurrentSeatingPlan() {
        if (!this.currentSeatingPlan) {
            showNotification(t('notifications.error.noSeatingPlanToSave'), 'error');
            return;
        }

        const planName = prompt(t('prompts.seatingPlanName'));
        if (!planName || !planName.trim()) {
            return;
        }

        try {
            const planData = {
                name: planName.trim(),
                layoutId: this.currentSeatingPlan.layoutId,
                rosterId: this.currentSeatingPlan.rosterId,
                assignments: this.currentSeatingPlan.assignments,
                layoutName: this.selectedLayout.name,
                rosterName: this.selectedRoster.name
            };

            StorageService.saveSeatingPlan(planData);
            showNotification(t('notifications.success.seatingPlanSaved', { name: planName }), 'success');
        } catch (error) {
            console.error('Failed to save seating plan:', error);
            showNotification(t('notifications.error.seatingPlanSaveFailed'), 'error');
        }
    }

    updateContent() {
        if (!this.selectedLayout || !this.selectedRoster || !this.currentSeatingPlan) {
            const content = document.getElementById('seating-plan-content');
            let message = t('plan.empty.selectBoth');

            if (!this.selectedLayout && !this.selectedRoster) {
                message = t('plan.empty.selectBoth');
            } else if (!this.selectedLayout) {
                message = t('plan.empty.selectLayout');
            } else if (!this.selectedRoster) {
                message = t('plan.empty.selectRoster');
            }

            content.innerHTML = `<p style="color: #6b7280;">${message}</p>`;
        }
    }
}

// Global functions for plan editor
function loadLayoutForPlan() {
    if (window.planEditor) {
        planEditor.loadLayoutForPlan();
    }
}

function loadRosterForPlan() {
    if (window.planEditor) {
        planEditor.loadRosterForPlan();
    }
}

function generateSeatingPlan() {
    if (window.planEditor) {
        planEditor.generateSeatingPlan();
    }
}

function regenerateSeatingPlan() {
    if (window.planEditor) {
        planEditor.regenerateSeatingPlan();
    }
}

function saveSeatingPlan() {
    if (window.planEditor) {
        planEditor.saveCurrentSeatingPlan();
    }
}

// Initialize plan editor when script loads
document.addEventListener('DOMContentLoaded', () => {
    window.planEditor = new PlanEditor();
});

document.addEventListener('languagechange', () => {
    if (window.planEditor) {
        planEditor.populateLayoutSelect();
        planEditor.populateRosterSelect();

        if (planEditor.currentSeatingPlan) {
            planEditor.renderSeatingPlan();
        } else {
            planEditor.updateContent();
        }
    }
});