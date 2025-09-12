// Local storage service for managing data persistence
class StorageService {
    static KEYS = {
        LAYOUTS: 'smartschool_layouts',
        ROSTERS: 'smartschool_rosters',
        SEATING_PLANS: 'smartschool_seating_plans',
        SEATING_RULES: 'smartschool_seating_rules',
        STUDENT_RULES: 'smartschool_student_rules'
    };

    // Layout management
    static getAllLayouts() {
        const layouts = localStorage.getItem(this.KEYS.LAYOUTS);
        return layouts ? JSON.parse(layouts) : [];
    }

    static getLayoutById(id) {
        const layouts = this.getAllLayouts();
        return layouts.find(layout => layout.id === id);
    }

    static getLayoutByName(name) {
        const layouts = this.getAllLayouts();
        return layouts.find(layout => layout.name === name);
    }

    static saveLayout(layoutData) {
        const layouts = this.getAllLayouts();
        const newLayout = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
            ...layoutData,
            created_at: Date.now(),
            updated_at: Date.now()
        };
        layouts.push(newLayout);
        localStorage.setItem(this.KEYS.LAYOUTS, JSON.stringify(layouts));
        return newLayout;
    }

    static updateLayout(id, layoutData) {
        const layouts = this.getAllLayouts();
        const index = layouts.findIndex(layout => layout.id === id);
        if (index !== -1) {
            layouts[index] = {
                ...layouts[index],
                ...layoutData,
                updated_at: Date.now()
            };
            localStorage.setItem(this.KEYS.LAYOUTS, JSON.stringify(layouts));
            return layouts[index];
        }
        return null;
    }

    static deleteLayout(id) {
        const layouts = this.getAllLayouts();
        const filteredLayouts = layouts.filter(layout => layout.id !== id);
        localStorage.setItem(this.KEYS.LAYOUTS, JSON.stringify(filteredLayouts));
    }

    // Roster management
    static getAllRosters() {
        const rosters = localStorage.getItem(this.KEYS.ROSTERS);
        return rosters ? JSON.parse(rosters) : [];
    }

    static getRosterById(id) {
        const rosters = this.getAllRosters();
        return rosters.find(roster => roster.id === id);
    }

    static getRosterByName(name) {
        const rosters = this.getAllRosters();
        return rosters.find(roster => roster.name === name);
    }

    static saveRoster(rosterData) {
        const rosters = this.getAllRosters();
        const newRoster = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
            ...rosterData,
            created_at: Date.now(),
            updated_at: Date.now()
        };
        rosters.push(newRoster);
        localStorage.setItem(this.KEYS.ROSTERS, JSON.stringify(rosters));
        return newRoster;
    }

    static updateRoster(id, rosterData) {
        const rosters = this.getAllRosters();
        const index = rosters.findIndex(roster => roster.id === id);
        if (index !== -1) {
            rosters[index] = {
                ...rosters[index],
                ...rosterData,
                updated_at: Date.now()
            };
            localStorage.setItem(this.KEYS.ROSTERS, JSON.stringify(rosters));
            return rosters[index];
        }
        return null;
    }

    static deleteRoster(id) {
        const rosters = this.getAllRosters();
        const filteredRosters = rosters.filter(roster => roster.id !== id);
        localStorage.setItem(this.KEYS.ROSTERS, JSON.stringify(filteredRosters));
    }

    // Seating plan management
    static getAllSeatingPlans() {
        const plans = localStorage.getItem(this.KEYS.SEATING_PLANS);
        return plans ? JSON.parse(plans) : [];
    }

    static getSeatingPlanById(id) {
        const plans = this.getAllSeatingPlans();
        return plans.find(plan => plan.id === id);
    }

    static saveSeatingPlan(planData) {
        const plans = this.getAllSeatingPlans();
        const newPlan = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
            ...planData,
            created_at: Date.now(),
            updated_at: Date.now()
        };
        plans.push(newPlan);
        localStorage.setItem(this.KEYS.SEATING_PLANS, JSON.stringify(plans));
        return newPlan;
    }

    static updateSeatingPlan(id, planData) {
        const plans = this.getAllSeatingPlans();
        const index = plans.findIndex(plan => plan.id === id);
        if (index !== -1) {
            plans[index] = {
                ...plans[index],
                ...planData,
                updated_at: Date.now()
            };
            localStorage.setItem(this.KEYS.SEATING_PLANS, JSON.stringify(plans));
            return plans[index];
        }
        return null;
    }

    static deleteSeatingPlan(id) {
        const plans = this.getAllSeatingPlans();
        const filteredPlans = plans.filter(plan => plan.id !== id);
        localStorage.setItem(this.KEYS.SEATING_PLANS, JSON.stringify(filteredPlans));
    }

    // Seating rules management
    static getSeatingRules() {
        const rules = localStorage.getItem(this.KEYS.SEATING_RULES);
        return rules ? JSON.parse(rules) : null;
    }

    static saveSeatingRules(rulesData) {
        const rules = {
            ...rulesData,
            updated_at: Date.now()
        };
        localStorage.setItem(this.KEYS.SEATING_RULES, JSON.stringify(rules));
        return rules;
    }

    // Student-specific rules management
    static getAllStudentRules() {
        const rules = localStorage.getItem(this.KEYS.STUDENT_RULES);
        return rules ? JSON.parse(rules) : {};
    }

    static getStudentRules(studentName) {
        const allRules = this.getAllStudentRules();
        return allRules[studentName] || null;
    }

    static saveStudentRules(studentName, rulesData) {
        const allRules = this.getAllStudentRules();
        allRules[studentName] = {
            ...rulesData,
            studentName,
            updated_at: Date.now()
        };
        localStorage.setItem(this.KEYS.STUDENT_RULES, JSON.stringify(allRules));
        return allRules[studentName];
    }

    static deleteStudentRules(studentName) {
        const allRules = this.getAllStudentRules();
        delete allRules[studentName];
        localStorage.setItem(this.KEYS.STUDENT_RULES, JSON.stringify(allRules));
    }

    // Utility methods
    static clearAllData() {
        localStorage.removeItem(this.KEYS.LAYOUTS);
        localStorage.removeItem(this.KEYS.ROSTERS);
        localStorage.removeItem(this.KEYS.SEATING_PLANS);
        localStorage.removeItem(this.KEYS.SEATING_RULES);
        localStorage.removeItem(this.KEYS.STUDENT_RULES);
    }

    static exportData() {
        return {
            layouts: this.getAllLayouts(),
            rosters: this.getAllRosters(),
            seatingPlans: this.getAllSeatingPlans()
        };
    }

    static importData(data) {
        if (data.layouts) {
            localStorage.setItem(this.KEYS.LAYOUTS, JSON.stringify(data.layouts));
        }
        if (data.rosters) {
            localStorage.setItem(this.KEYS.ROSTERS, JSON.stringify(data.rosters));
        }
        if (data.seatingPlans) {
            localStorage.setItem(this.KEYS.SEATING_PLANS, JSON.stringify(data.seatingPlans));
        }
    }
}

// Export for global access
window.StorageService = StorageService;