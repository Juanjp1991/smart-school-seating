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
        this.updateContent();
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
            showNotification('Please select both a layout and a roster.', 'error');
            return;
        }

        const seats = this.selectedLayout.seats || [];
        const students = this.selectedRoster.students || [];

        if (seats.length === 0) {
            showNotification('The selected layout has no seats.', 'error');
            return;
        }

        if (students.length === 0) {
            showNotification('The selected roster has no students.', 'error');
            return;
        }

        if (students.length > seats.length) {
            showNotification(`Not enough seats (${seats.length}) for all students (${students.length}).`, 'error');
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
        showNotification('Seating plan generated successfully!', 'success');
    }

    renderSeatingPlan() {
        const content = document.getElementById('seating-plan-content');
        
        if (!this.currentSeatingPlan) {
            content.innerHTML = '<p style="color: #6b7280;">Select a layout and roster to generate a seating plan.</p>';
            return;
        }

        const layout = this.selectedLayout;
        const roster = this.selectedRoster;
        
        // Calculate grid dimensions
        const cellSize = 120;
        const gap = 16;

        content.innerHTML = `
            <div style="margin-bottom: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <div>
                        <h3 style="font-size: 1.125rem; font-weight: 600;">Seating Plan</h3>
                        <p style="font-size: 0.875rem; color: #6b7280;">
                            Layout: ${layout.name} | Roster: ${roster.name} | 
                            Generated: ${new Date(this.currentSeatingPlan.generatedAt).toLocaleString()}
                        </p>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button onclick="regenerateSeatingPlan()" class="button-secondary">Regenerate</button>
                        <button onclick="saveSeatingPlan()" class="button-primary">Save Plan</button>
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
                        cell.innerHTML = `<span class="student-name">${assignedStudent}</span>`;
                        cell.addEventListener('click', () => this.handleSeatClick(seatKey));
                    } else {
                        cell.className = 'student-card';
                        cell.innerHTML = '<span class="empty-seat">Empty Seat</span>';
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

    handleSeatClick(seatKey) {
        if (!this.currentSeatingPlan) return;

        const currentStudent = this.assignments.get(seatKey);
        const availableStudents = this.selectedRoster.students.filter(student => 
            !Array.from(this.assignments.values()).includes(student) || student === currentStudent
        );

        if (availableStudents.length === 0 && !currentStudent) {
            showNotification('All students are already assigned to seats.', 'info');
            return;
        }

        // Create a simple prompt for student selection
        let options = ['Remove student'];
        if (currentStudent) {
            options.push(`Keep ${currentStudent}`);
        }
        options.push(...availableStudents.filter(s => s !== currentStudent));

        const choice = prompt(
            `Current seat assignment: ${currentStudent || 'Empty'}\n\nChoose an option:\n` +
            options.map((option, index) => `${index}: ${option}`).join('\n'),
            '0'
        );

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
            showNotification('No seating plan to save.', 'error');
            return;
        }

        const planName = prompt('Enter a name for this seating plan:');
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
            showNotification(`Seating plan "${planName}" saved successfully!`, 'success');
        } catch (error) {
            console.error('Failed to save seating plan:', error);
            showNotification('Failed to save seating plan. Please try again.', 'error');
        }
    }

    updateContent() {
        if (!this.selectedLayout || !this.selectedRoster || !this.currentSeatingPlan) {
            const content = document.getElementById('seating-plan-content');
            let message = 'Select a layout and roster to generate a seating plan.';
            
            if (!this.selectedLayout && !this.selectedRoster) {
                message = 'Select a layout and roster to generate a seating plan.';
            } else if (!this.selectedLayout) {
                message = 'Select a layout to continue.';
            } else if (!this.selectedRoster) {
                message = 'Select a roster to continue.';
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