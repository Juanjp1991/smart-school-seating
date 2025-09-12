// Layout Editor functionality
class LayoutEditor {
    constructor() {
        this.rows = 8;
        this.cols = 6;
        this.selectedTool = 'seat';
        this.rotation = 'horizontal';
        this.furniture = [];
        this.seats = new Set();
        this.hoveredCell = null;
        this.existingLayoutName = null;
        
        this.initializeEventListeners();
        
        // Set initial tool state after DOM is ready
        setTimeout(() => {
            this.selectTool('seat');
        }, 100);
    }

    initializeEventListeners() {
        // Grid size inputs
        const rowsInput = document.getElementById('rows-input');
        const colsInput = document.getElementById('cols-input');
        
        if (rowsInput) rowsInput.addEventListener('change', () => this.updateGridSize());
        if (colsInput) colsInput.addEventListener('change', () => this.updateGridSize());
    }

    updateGridSize() {
        const rowsInput = document.getElementById('rows-input');
        const colsInput = document.getElementById('cols-input');
        
        this.rows = parseInt(rowsInput.value) || 8;
        this.cols = parseInt(colsInput.value) || 6;
        
        // Clear furniture and seats that are outside new bounds
        this.furniture = this.furniture.filter(item => 
            item.positions.every(pos => pos.row < this.rows && pos.col < this.cols)
        );
        
        const validSeats = new Set();
        this.seats.forEach(seatKey => {
            const [row, col] = seatKey.split('-').map(Number);
            if (row < this.rows && col < this.cols) {
                validSeats.add(seatKey);
            }
        });
        this.seats = validSeats;
        
        this.renderGrid();
    }

    selectTool(tool) {
        this.selectedTool = tool;
        
        // Update button states with new Tailwind classes
        const seatBtn = document.getElementById('seat-tool');
        const deskBtn = document.getElementById('desk-tool');
        const doorBtn = document.getElementById('door-tool');
        
        // Reset all buttons to inactive state
        if (seatBtn) {
            seatBtn.className = 'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200';
        }
        if (deskBtn) {
            deskBtn.className = 'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200';
        }
        if (doorBtn) {
            doorBtn.className = 'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200';
        }
        
        // Set active button
        const activeBtn = document.getElementById(`${tool}-tool`);
        if (activeBtn) {
            if (tool === 'seat') {
                activeBtn.className = 'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 bg-green-600 text-white shadow-md';
            } else if (tool === 'desk') {
                activeBtn.className = 'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 bg-amber-600 text-white shadow-md';
            } else if (tool === 'door') {
                activeBtn.className = 'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 bg-orange-600 text-white shadow-md';
            }
        }
        
        // Show/hide rotation button based on selected tool
        const rotationBtn = document.getElementById('rotation-button');
        if (rotationBtn) {
            rotationBtn.style.display = tool === 'desk' ? 'inline-block' : 'none';
        }
    }

    toggleRotation() {
        this.rotation = this.rotation === 'horizontal' ? 'vertical' : 'horizontal';
        document.getElementById('rotation-text').textContent = 
            this.rotation.charAt(0).toUpperCase() + this.rotation.slice(1);
    }

    getDeskPositions(row, col, rotation) {
        if (rotation === 'horizontal') {
            return [{ row, col }, { row, col: col + 1 }];
        } else {
            return [{ row, col }, { row: row + 1, col }];
        }
    }

    isValidPosition(positions) {
        return positions.every(pos => 
            pos.row >= 0 && pos.row < this.rows && pos.col >= 0 && pos.col < this.cols &&
            !this.furniture.some(item => 
                item.positions.some(itemPos => itemPos.row === pos.row && itemPos.col === pos.col)
            )
        );
    }

    getFurnitureAt(row, col) {
        return this.furniture.find(item => 
            item.positions.some(pos => pos.row === row && pos.col === col)
        ) || null;
    }

    getSeatKey(row, col) {
        return `${row}-${col}`;
    }

    hasSeat(row, col) {
        return this.seats.has(this.getSeatKey(row, col));
    }

    handleCellClick(row, col) {
        const existingFurniture = this.getFurnitureAt(row, col);
        const existingSeat = this.hasSeat(row, col);
        
        // First check: if there's existing furniture, remove it regardless of selected tool
        if (existingFurniture) {
            this.furniture = this.furniture.filter(item => item.id !== existingFurniture.id);
            this.renderGrid();
            return;
        }
        
        // Handle seat tool
        if (this.selectedTool === 'seat') {
            const seatKey = this.getSeatKey(row, col);
            
            if (existingSeat) {
                // Remove existing seat
                this.seats.delete(seatKey);
            } else {
                // Add new seat
                this.seats.add(seatKey);
            }
            this.renderGrid();
            return;
        }
        
        if (existingSeat) {
            // Remove seat when placing furniture
            const seatKey = this.getSeatKey(row, col);
            this.seats.delete(seatKey);
        }

        if (this.selectedTool === 'desk') {
            const positions = this.getDeskPositions(row, col, this.rotation);
            // Check for seats in desk positions
            const hasSeatsInPositions = positions.some(pos => this.hasSeat(pos.row, pos.col));
            const isValid = this.isValidPosition(positions);
            
            if (isValid && !hasSeatsInPositions) {
                // Remove any seats that would be under the desk
                positions.forEach(pos => this.seats.delete(this.getSeatKey(pos.row, pos.col)));
                
                const newDesk = {
                    id: `desk-${Date.now()}`,
                    type: 'desk',
                    positions,
                    rotation: this.rotation
                };
                this.furniture.push(newDesk);
                this.renderGrid();
            }
        } else if (this.selectedTool === 'door') {
            const positions = [{ row, col }];
            const isValid = this.isValidPosition(positions);
            
            if (isValid) {
                const newDoor = {
                    id: `door-${Date.now()}`,
                    type: 'door',
                    positions
                };
                this.furniture.push(newDoor);
                this.renderGrid();
            }
        }
        
        this.renderGrid();
    }

    getPreviewPositions() {
        if (!this.hoveredCell || this.selectedTool === 'seat') return [];
        
        if (this.selectedTool === 'desk') {
            const positions = this.getDeskPositions(this.hoveredCell.row, this.hoveredCell.col, this.rotation);
            return this.isValidPosition(positions) ? positions : [];
        } else if (this.selectedTool === 'door') {
            const positions = [this.hoveredCell];
            return this.isValidPosition(positions) ? positions : [];
        }
        
        return [];
    }

    handleCellHover(row, col) {
        if (this.selectedTool !== 'seat') {
            const newHoveredCell = { row, col };
            // Only re-render if hover state actually changed
            if (!this.hoveredCell || this.hoveredCell.row !== row || this.hoveredCell.col !== col) {
                this.hoveredCell = newHoveredCell;
                this.renderGrid();
            }
        }
    }

    handleCellLeave() {
        if (this.hoveredCell) {
            this.hoveredCell = null;
            this.renderGrid();
        }
    }

    initializeGrid() {
        console.log('Initializing grid with rows:', this.rows, 'cols:', this.cols);
        setTimeout(() => {
            this.renderGrid();
        }, 10);
    }

    renderGrid() {
        const gridContainer = document.getElementById('classroom-grid');
        if (!gridContainer) {
            console.error('Grid container not found!');
            return;
        }
        console.log('Rendering grid with', this.rows, 'x', this.cols);

        const previewPositions = this.getPreviewPositions();
        
        // Calculate dimensions
        const containerPadding = 30;
        const gap = 3;
        const maxWidth = window.innerWidth * 0.85;
        const maxHeight = (window.innerHeight - 200) * 0.9;
        
        const availableWidth = maxWidth - containerPadding - (gap * (this.cols - 1));
        const availableHeight = maxHeight - containerPadding - (gap * (this.rows - 1));
        
        const cellWidth = Math.floor(availableWidth / this.cols);
        const cellHeight = Math.floor(availableHeight / this.rows);
        
        const cellSize = Math.max(30, Math.min(cellWidth, cellHeight));

        // Create grid
        gridContainer.innerHTML = '';
        gridContainer.className = 'classroom-grid';
        gridContainer.style.cssText = `
            display: grid;
            grid-template-rows: repeat(${this.rows}, ${cellSize}px);
            grid-template-columns: repeat(${this.cols}, ${cellSize}px);
            gap: 3px;
            border: 2px solid #333;
            padding: 15px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            justify-content: center;
            align-content: center;
        `;

        // Create cells
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                const furnitureItem = this.getFurnitureAt(row, col);
                const isPreview = previewPositions.some(pos => pos.row === row && pos.col === col);
                const seatExists = this.hasSeat(row, col);
                
                let cellClass = 'grid-cell';
                let cellContent = '';
                
                if (furnitureItem) {
                    cellClass += ` furniture-${furnitureItem.type}`;
                    cellContent = furnitureItem.type === 'desk' ? '🪑' : '🚪';
                } else if (seatExists) {
                    cellClass += ' seat';
                    cellContent = '💺';
                } else if (isPreview && this.selectedTool !== 'seat') {
                    cellClass += ' furniture-preview';
                    cellContent = this.selectedTool === 'desk' ? '🪑' : '🚪';
                }
                
                cell.className = cellClass;
                cell.textContent = cellContent;
                cell.style.cssText = `
                    grid-row: ${row + 1};
                    grid-column: ${col + 1};
                `;
                
                // Add event listeners
                cell.addEventListener('click', () => this.handleCellClick(row, col));
                cell.addEventListener('mouseenter', () => this.handleCellHover(row, col));
                cell.addEventListener('mouseleave', () => this.handleCellLeave());
                
                gridContainer.appendChild(cell);
            }
        }
    }

    loadLayout(layout) {
        this.rows = layout.grid_rows;
        this.cols = layout.grid_cols;
        this.furniture = layout.furniture;
        this.seats = new Set(layout.seats);
        
        // Update UI
        document.getElementById('rows-input').value = this.rows;
        document.getElementById('cols-input').value = this.cols;
        
        this.renderGrid();
        showNotification(`Layout "${layout.name}" loaded successfully!`, 'success');
    }
}

// Modal functions for layout editor
function showSaveModal() {
    document.getElementById('save-modal').style.display = 'flex';
    document.getElementById('layout-name').focus();
}

function closeSaveModal() {
    document.getElementById('save-modal').style.display = 'none';
    document.getElementById('save-error').style.display = 'none';
    document.getElementById('layout-name').value = '';
    if (window.layoutEditor) {
        layoutEditor.existingLayoutName = null;
    }
}

function saveLayout() {
    const layoutName = document.getElementById('layout-name').value.trim();
    const errorEl = document.getElementById('save-error');
    
    if (!layoutName) {
        errorEl.textContent = 'Please enter a layout name.';
        errorEl.style.display = 'block';
        return;
    }

    try {
        // Check if layout exists
        const existingLayout = StorageService.getLayoutByName(layoutName);
        
        if (existingLayout && layoutEditor.existingLayoutName !== layoutName) {
            // Show confirmation for overwrite
            layoutEditor.existingLayoutName = layoutName;
            errorEl.innerHTML = `A layout named "${layoutName}" already exists. <strong>Click Save again to overwrite it.</strong>`;
            errorEl.style.display = 'block';
            return;
        }

        // Prepare layout data
        const layoutData = {
            name: layoutName,
            grid_rows: layoutEditor.rows,
            grid_cols: layoutEditor.cols,
            furniture: layoutEditor.furniture,
            seats: Array.from(layoutEditor.seats)
        };

        if (existingLayout) {
            // Update existing layout
            StorageService.updateLayout(existingLayout.id, layoutData);
            showNotification(`Layout "${layoutName}" updated successfully!`, 'success');
        } else {
            // Create new layout
            StorageService.saveLayout(layoutData);
            showNotification(`Layout "${layoutName}" saved successfully!`, 'success');
        }
        
        // Update dropdown in plan editor if present
        if (app) {
            app.populateLayoutSelect();
        }
        
        closeSaveModal();
        
    } catch (error) {
        console.error('Failed to save layout:', error);
        errorEl.textContent = 'Failed to save layout. Please try again.';
        errorEl.style.display = 'block';
    }
}

function showLoadModal() {
    const modal = document.getElementById('load-modal');
    const layoutList = document.getElementById('layout-list');
    
    const layouts = StorageService.getAllLayouts();
    
    if (layouts.length === 0) {
        layoutList.innerHTML = `
            <div class="empty-state">
                <p>No saved layouts found.</p>
                <p class="empty-state-subtitle">Create and save a layout first.</p>
            </div>
        `;
    } else {
        layoutList.innerHTML = layouts.map(layout => `
            <div class="template-item">
                <div class="template-info">
                    <h3 class="template-name">${layout.name}</h3>
                    <div class="template-details">
                        <span class="template-size">${layout.grid_rows} × ${layout.grid_cols}</span>
                        <span class="template-date">${formatDate(layout.created_at)}</span>
                    </div>
                </div>
                <button class="template-load-button button-primary" onclick="loadLayoutById('${layout.id}')">
                    Load
                </button>
            </div>
        `).join('');
    }
    
    modal.style.display = 'flex';
}

function closeLoadModal() {
    document.getElementById('load-modal').style.display = 'none';
}

function loadLayoutById(layoutId) {
    const layout = StorageService.getLayoutById(layoutId);
    if (layout && window.layoutEditor) {
        layoutEditor.loadLayout(layout);
        closeLoadModal();
    }
}

// Global functions for toolbar
function selectTool(tool) {
    if (window.layoutEditor) {
        layoutEditor.selectTool(tool);
    }
}

function toggleRotation() {
    if (window.layoutEditor) {
        layoutEditor.toggleRotation();
    }
}

function updateGridSize() {
    if (window.layoutEditor) {
        layoutEditor.updateGridSize();
    }
}

// Initialize layout editor when script loads
document.addEventListener('DOMContentLoaded', () => {
    window.layoutEditor = new LayoutEditor();
});