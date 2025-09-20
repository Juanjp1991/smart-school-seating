const translations = {
    en: {
        meta: {
            title: 'SmartSchool - Classroom Seating',
            description: 'Intelligent classroom seating arrangement tool for teachers'
        },
        controls: {
            darkMode: 'Toggle dark mode'
        },
        language: {
            toggleToDutch: 'Switch to Dutch',
            toggleToEnglish: 'Switch to English'
        },
        nav: {
            brand: 'SmartSchool Seating'
        },
        home: {
            heroTitle: 'SmartSchool<span class="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text">Seating</span>',
            heroSubtitle: 'Revolutionary classroom seating arrangement platform for modern educators. <span class="text-blue-600 font-semibold">Create intelligent layouts</span>, <span class="text-purple-600 font-semibold">manage student rosters</span>, and <span class="text-indigo-600 font-semibold">generate optimal seating plans</span>.',
            cards: {
                layout: {
                    title: 'Layout Designer',
                    description: 'Design sophisticated classroom layouts with intuitive drag-and-drop tools for desks, seats, and room elements',
                    cta: 'Create Layout'
                },
                rosters: {
                    title: 'Student Rosters',
                    description: 'Organize and manage comprehensive student databases with detailed profiles, preferences, and academic information',
                    cta: 'Manage Students'
                },
                plan: {
                    title: 'AI Seating Plans',
                    description: 'Generate intelligent, optimized seating arrangements using advanced algorithms and student behavioral insights',
                    cta: 'Generate Plans'
                }
            },
            systemStatus: 'System Ready • All Features Online'
        },
        actions: {
            backToHome: '← Back to Home'
        },
        layout: {
            controls: {
                rowsLabel: 'Rows:',
                colsLabel: 'Cols:',
                toolsLabel: 'Tools:',
                seatTool: 'Seat',
                deskTool: 'Desk',
                doorTool: 'Door',
                rotateLabel: 'Rotate:'
            },
            rotation: {
                horizontal: 'Horizontal',
                vertical: 'Vertical'
            },
            actions: {
                load: 'Load Layout',
                save: 'Save Layout',
                loadButton: 'Load'
            }
        },
        rosters: {
            title: 'Roster Management',
            actions: {
                importCsv: 'Import CSV',
                seatingRules: 'Seating Rules',
                create: 'Create New Roster'
            },
            manageTitle: 'Manage Student Rosters',
            empty: {
                title: 'No rosters created yet',
                subtitle: 'Click "Create New Roster" to get started'
            }
        },
        plan: {
            controls: {
                layoutLabel: 'Layout:',
                layoutPlaceholder: 'Select a Layout',
                rosterLabel: 'Roster:',
                rosterPlaceholder: 'Select a Roster'
            },
            actions: {
                generate: 'Generate Seating Plan',
                regenerate: 'Regenerate',
                save: 'Save Plan'
            },
            title: 'Create Seating Plan',
            empty: {
                title: 'Ready to Create Seating Plan',
                subtitle: 'Select a layout and roster to generate an optimal seating arrangement',
                selectBoth: 'Select a layout and roster to generate a seating plan.',
                selectLayout: 'Select a layout to continue.',
                selectRoster: 'Select a roster to continue.'
            }
        },
        modals: {
            actions: {
                cancel: 'Cancel',
                save: 'Save'
            },
            saveLayout: {
                title: 'Save Layout',
                nameLabel: 'Layout Name:',
                namePlaceholder: 'Enter layout name...'
            },
            loadLayout: {
                title: 'Load Layout',
                emptyTitle: 'No saved layouts found.',
                emptySubtitle: 'Create and save a layout first.'
            },
            roster: {
                titleCreate: 'Create New Roster',
                titleEdit: 'Edit Roster',
                nameLabel: 'Roster Name:',
                namePlaceholder: 'Enter roster name...',
                studentsLabel: 'Students (one per line):',
                studentsPlaceholder: 'Enter student names, one per line...'
            },
            importCsv: {
                title: 'Import Students from CSV',
                requirementsTitle: 'CSV Format Requirements:',
                requirements: {
                    item1: '• First row should contain headers',
                    item2: '• Required column: <code class="bg-blue-100 px-1 rounded">name</code> (student name)',
                    item3: '• Optional columns: <code class="bg-blue-100 px-1 rounded">grade</code>, <code class="bg-blue-100 px-1 rounded">needs</code>, <code class="bg-blue-100 px-1 rounded">notes</code>',
                    item4: '• Example: <code class="bg-blue-100 px-1 rounded">name,grade,needs,notes</code>'
                },
                nameLabel: 'Roster Name:',
                namePlaceholder: 'Enter roster name for imported data...',
                fileLabel: 'Choose CSV File:',
                previewLabel: 'Preview:',
                previewPlaceholder: 'Select a CSV file to see preview...',
                submit: 'Import Roster'
            },
            seatingRules: {
                title: 'Seating Rules Configuration',
                studentRulesTitle: 'Student-Specific Rules',
                selectStudentLabel: 'Select Student:',
                selectStudentPlaceholder: 'Choose a student to set specific rules...',
                rulesFor: 'Rules for',
                studentOptions: {
                    vision: 'Vision needs - avoid front row',
                    behavior: 'Behavioral considerations - separate from others',
                    attention: 'Needs attention - place near teacher',
                    group: 'Prefers group work'
                },
                studentDescriptions: {
                    vision: 'Vision needs',
                    behavior: 'Behavioral considerations',
                    attention: 'Needs attention',
                    group: 'Prefers group work',
                    none: 'No specific rules'
                },
                saveStudent: 'Save Rules for This Student',
                generalTitle: 'General Rules',
                general: {
                    random: 'Random Seating',
                    randomDescription: 'Randomly assign students to available seats',
                    avoidFront: 'Avoid Front Row',
                    avoidFrontDescription: "Don't place students with vision needs in front row",
                    separateDisruptive: 'Separate Disruptive',
                    separateDisruptiveDescription: 'Keep students with behavioral notes apart',
                    teacherProximity: 'Teacher Proximity',
                    teacherProximityDescription: 'Place students needing attention near teacher desk'
                },
                advancedTitle: 'Advanced Settings',
                maxGroupSizeLabel: 'Maximum Group Size:',
                maxGroupSizeHint: 'students per cluster',
                minDistanceLabel: 'Minimum Distance Between Problem Students:',
                minDistanceHint: 'seats apart',
                currentRulesTitle: 'Current Student Rules',
                currentRulesEmpty: 'No student-specific rules configured yet.',
                remove: 'Remove',
                reset: 'Reset to Defaults',
                save: 'Save Rules'
            }
        },
        notifications: {
            success: {
                layoutLoaded: 'Layout "{{name}}" loaded successfully!',
                layoutSaved: 'Layout "{{name}}" saved successfully!',
                layoutUpdated: 'Layout "{{name}}" updated successfully!',
                rosterCreated: 'Roster "{{name}}" created successfully!',
                rosterUpdated: 'Roster "{{name}}" updated successfully!',
                rosterDeleted: 'Roster "{{name}}" deleted successfully!',
                rosterImported: 'Roster "{{name}}" imported successfully with {{count}} students!',
                seatingPlanGenerated: 'Seating plan generated successfully!',
                seatingPlanSaved: 'Seating plan "{{name}}" saved successfully!',
                seatingRulesSaved: 'Seating rules saved successfully!',
                studentRulesSaved: 'Rules saved for {{name}}!',
                studentRulesRemoved: 'Rules removed for {{name}}',
                swapStudents: 'Swapped {{first}} with {{second}}',
                moveToSeat: 'Moved {{student}} to new seat'
            },
            error: {
                layoutNameRequired: 'Please enter a layout name.',
                layoutSaveFailed: 'Failed to save layout. Please try again.',
                rosterNameRequired: 'Please enter a roster name.',
                rosterStudentRequired: 'Please enter at least one student name.',
                rosterExists: 'A roster with this name already exists.',
                rosterSaveFailed: 'Failed to save roster. Please try again.',
                rosterDeleteConfirm: 'Are you sure you want to delete the roster "{{name}}"? This action cannot be undone.',
                rosterDeleteFailed: 'Failed to delete roster. Please try again.',
                rosterViewEmpty: 'No students in this roster.',
                csvNameRequired: 'Please enter a roster name.',
                csvFileRequired: 'Please select a CSV file.',
                csvDuplicateName: 'A roster with this name already exists.',
                csvStructure: 'CSV must have at least a header row and one data row.',
                csvMissingName: 'CSV must have a "name" column.',
                csvNoStudents: 'No valid student names found in CSV.',
                csvImportFailed: 'Failed to import CSV. Please check the file format.',
                seatingPlanRequirements: 'Please select both a layout and a roster.',
                seatingPlanNoSeats: 'The selected layout has no seats.',
                seatingPlanNoStudents: 'The selected roster has no students.',
                seatingPlanNotEnoughSeats: 'Not enough seats ({{seats}}) for all students ({{students}}).',
                noSeatingPlanToSave: 'No seating plan to save.',
                seatingPlanSaveFailed: 'Failed to save seating plan. Please try again.',
                seatingRulesSaveFailed: 'Failed to save seating rules. Please try again.',
                studentSelectionRequired: 'Please select a student first.',
                studentRulesSaveFailed: 'Failed to save student rules. Please try again.',
                studentRulesRemoveFailed: 'Failed to remove student rules.',
                seatingRulesError: 'Failed to save seating rules. Please try again.'
            },
            info: {
                allStudentsAssigned: 'All students are already assigned to seats.'
            }
        },
        prompts: {
            layoutOverwrite: 'A layout named "{{name}}" already exists. <strong>Click Save again to overwrite it.</strong>',
            rosterDelete: 'Are you sure you want to delete the roster "{{name}}"? This action cannot be undone.',
            seatAssignment: 'Current seat assignment: {{current}}\n\nChoose an option:\n',
            seatOptions: {
                remove: 'Remove student',
                keep: 'Keep {{name}}'
            },
            removeStudentRules: 'Remove all rules for {{name}}?',
            seatingPlanName: 'Enter a name for this seating plan:'
        },
        tables: {
            csv: {
                headerError: 'Error: CSV must have at least a header row and one data row.',
                nameError: 'Error: CSV must have a "name" column.',
                footerMoreRows: '... and {{count}} more rows',
                foundStudents: '✓ Found {{count}} students',
                readError: 'Error reading CSV file. Please check the file format.'
            }
        },
        roster: {
            studentCount: '{{count}} students',
            previewPrefix: 'Students:',
            previewMore: '... and {{count}} more',
            actions: {
                edit: 'Edit',
                view: 'View',
                delete: 'Delete'
            }
        },
        planEditor: {
            seatingPlanTitle: 'Seating Plan',
            summary: 'Layout: {{layout}} | Roster: {{roster}} | Generated: {{generated}}',
            emptySeat: 'Empty Seat'
        }
    },
    nl: {
        meta: {
            title: 'SmartSchool - Zitplaatsen',
            description: 'Intelligente tool voor klaslokaalindelingen voor leerkrachten'
        },
        controls: {
            darkMode: 'Donkere modus wisselen'
        },
        language: {
            toggleToDutch: 'Schakel naar Nederlands',
            toggleToEnglish: 'Schakel naar Engels'
        },
        nav: {
            brand: 'SmartSchool Zitplaatsen'
        },
        home: {
            heroTitle: 'SmartSchool<span class="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text">Zitplaatsen</span>',
            heroSubtitle: 'Revolutionair platform voor klaslokaalindelingen voor moderne leerkrachten. <span class="text-blue-600 font-semibold">Maak intelligente plattegronden</span>, <span class="text-purple-600 font-semibold">beheer leerlingenlijsten</span> en <span class="text-indigo-600 font-semibold">genereer optimale zitplannen</span>.',
            cards: {
                layout: {
                    title: 'Plattegrondontwerper',
                    description: 'Ontwerp geavanceerde klaslokaalopstellingen met intuïtieve drag-and-drop tools voor bureaus, stoelen en inrichting',
                    cta: 'Maak een plattegrond'
                },
                rosters: {
                    title: 'Leerlingenlijsten',
                    description: 'Organiseer en beheer uitgebreide leerlingendatabases met gedetailleerde profielen, voorkeuren en studie-informatie',
                    cta: 'Beheer leerlingen'
                },
                plan: {
                    title: 'AI-zitplannen',
                    description: 'Genereer intelligente, geoptimaliseerde zitindelingen met geavanceerde algoritmen en inzichten in leerlinggedrag',
                    cta: 'Genereer plannen'
                }
            },
            systemStatus: 'Systeem gereed • Alle functies actief'
        },
        actions: {
            backToHome: '← Terug naar start'
        },
        layout: {
            controls: {
                rowsLabel: 'Rijen:',
                colsLabel: 'Kolommen:',
                toolsLabel: 'Gereedschap:',
                seatTool: 'Stoel',
                deskTool: 'Bureau',
                doorTool: 'Deur',
                rotateLabel: 'Draaien:'
            },
            rotation: {
                horizontal: 'Horizontaal',
                vertical: 'Verticaal'
            },
            actions: {
                load: 'Indeling laden',
                save: 'Indeling opslaan',
                loadButton: 'Laden'
            }
        },
        rosters: {
            title: 'Leerlingenbeheer',
            actions: {
                importCsv: 'CSV importeren',
                seatingRules: 'Zitregels',
                create: 'Nieuwe lijst maken'
            },
            manageTitle: 'Beheer leerlingenlijsten',
            empty: {
                title: 'Nog geen lijsten aangemaakt',
                subtitle: 'Klik op "Nieuwe lijst maken" om te starten'
            }
        },
        plan: {
            controls: {
                layoutLabel: 'Indeling:',
                layoutPlaceholder: 'Kies een indeling',
                rosterLabel: 'Leerlingenlijst:',
                rosterPlaceholder: 'Kies een leerlingenlijst'
            },
            actions: {
                generate: 'Zitplan genereren',
                regenerate: 'Opnieuw genereren',
                save: 'Plan opslaan'
            },
            title: 'Zitplan maken',
            empty: {
                title: 'Klaar om een zitplan te maken',
                subtitle: 'Selecteer een indeling en leerlingenlijst om een optimaal zitplan te genereren',
                selectBoth: 'Selecteer een indeling en leerlingenlijst om een zitplan te genereren.',
                selectLayout: 'Selecteer een indeling om verder te gaan.',
                selectRoster: 'Selecteer een leerlingenlijst om verder te gaan.'
            }
        },
        modals: {
            actions: {
                cancel: 'Annuleren',
                save: 'Opslaan'
            },
            saveLayout: {
                title: 'Indeling opslaan',
                nameLabel: 'Naam van indeling:',
                namePlaceholder: 'Voer de naam van de indeling in...'
            },
            loadLayout: {
                title: 'Indeling laden',
                emptyTitle: 'Geen opgeslagen indelingen gevonden.',
                emptySubtitle: 'Maak en bewaar eerst een indeling.'
            },
            roster: {
                titleCreate: 'Nieuwe lijst maken',
                titleEdit: 'Lijst bewerken',
                nameLabel: 'Naam van lijst:',
                namePlaceholder: 'Voer de naam van de lijst in...',
                studentsLabel: 'Leerlingen (één per regel):',
                studentsPlaceholder: 'Voer de namen van leerlingen in, één per regel...'
            },
            importCsv: {
                title: 'Leerlingen importeren uit CSV',
                requirementsTitle: 'CSV-formaat vereisten:',
                requirements: {
                    item1: '• De eerste rij bevat de kolomnamen',
                    item2: '• Verplichte kolom: <code class="bg-blue-100 px-1 rounded">name</code> (leerlingnaam)',
                    item3: '• Optionele kolommen: <code class="bg-blue-100 px-1 rounded">grade</code>, <code class="bg-blue-100 px-1 rounded">needs</code>, <code class="bg-blue-100 px-1 rounded">notes</code>',
                    item4: '• Voorbeeld: <code class="bg-blue-100 px-1 rounded">name,grade,needs,notes</code>'
                },
                nameLabel: 'Naam van lijst:',
                namePlaceholder: 'Voer een naam in voor de geïmporteerde lijst...',
                fileLabel: 'Kies CSV-bestand:',
                previewLabel: 'Voorbeeld:',
                previewPlaceholder: 'Selecteer een CSV-bestand om een voorbeeld te zien...',
                submit: 'Lijst importeren'
            },
            seatingRules: {
                title: 'Configuratie zitregels',
                studentRulesTitle: 'Specifieke regels per leerling',
                selectStudentLabel: 'Selecteer leerling:',
                selectStudentPlaceholder: 'Kies een leerling om specifieke regels in te stellen...',
                rulesFor: 'Regels voor',
                studentOptions: {
                    vision: 'Zichtproblemen - vermijd voorste rij',
                    behavior: 'Gedragsafspraken - houd gescheiden',
                    attention: 'Heeft aandacht nodig - plaats dicht bij docent',
                    group: 'Werkt graag in groep'
                },
                studentDescriptions: {
                    vision: 'Zichtproblemen',
                    behavior: 'Gedragsafspraken',
                    attention: 'Heeft aandacht nodig',
                    group: 'Werkt graag in groep',
                    none: 'Geen specifieke regels'
                },
                saveStudent: 'Regels voor deze leerling opslaan',
                generalTitle: 'Algemene regels',
                general: {
                    random: 'Willekeurige zitplaatsen',
                    randomDescription: 'Wijs leerlingen willekeurig toe aan beschikbare zitplaatsen',
                    avoidFront: 'Voorste rij vermijden',
                    avoidFrontDescription: 'Plaats leerlingen met zichtproblemen niet vooraan',
                    separateDisruptive: 'Onruststokers scheiden',
                    separateDisruptiveDescription: 'Houd leerlingen met gedragsopmerkingen uit elkaar',
                    teacherProximity: 'Dicht bij docent',
                    teacherProximityDescription: 'Plaats leerlingen die extra aandacht nodig hebben dicht bij het bureau van de docent'
                },
                advancedTitle: 'Geavanceerde instellingen',
                maxGroupSizeLabel: 'Maximale groepsgrootte:',
                maxGroupSizeHint: 'leerlingen per groep',
                minDistanceLabel: 'Minimale afstand tussen probleemleerlingen:',
                minDistanceHint: 'stoelen uit elkaar',
                currentRulesTitle: 'Huidige leerlingregels',
                currentRulesEmpty: 'Nog geen leerling specifieke regels ingesteld.',
                remove: 'Verwijderen',
                reset: 'Terug naar standaardinstellingen',
                save: 'Regels opslaan'
            }
        },
        notifications: {
            success: {
                layoutLoaded: 'Indeling "{{name}}" is geladen!',
                layoutSaved: 'Indeling "{{name}}" is opgeslagen!',
                layoutUpdated: 'Indeling "{{name}}" is bijgewerkt!',
                rosterCreated: 'Lijst "{{name}}" is aangemaakt!',
                rosterUpdated: 'Lijst "{{name}}" is bijgewerkt!',
                rosterDeleted: 'Lijst "{{name}}" is verwijderd!',
                rosterImported: 'Lijst "{{name}}" is geïmporteerd met {{count}} leerlingen!',
                seatingPlanGenerated: 'Zitplan is succesvol gegenereerd!',
                seatingPlanSaved: 'Zitplan "{{name}}" is opgeslagen!',
                seatingRulesSaved: 'Zitregels zijn opgeslagen!',
                studentRulesSaved: 'Regels voor {{name}} opgeslagen!',
                studentRulesRemoved: 'Regels voor {{name}} verwijderd',
                swapStudents: '{{first}} en {{second}} verwisseld',
                moveToSeat: '{{student}} verplaatst naar nieuwe stoel'
            },
            error: {
                layoutNameRequired: 'Vul een naam voor de indeling in.',
                layoutSaveFailed: 'Opslaan van indeling mislukt. Probeer het opnieuw.',
                rosterNameRequired: 'Vul een naam voor de lijst in.',
                rosterStudentRequired: 'Vul minstens één leerlingnaam in.',
                rosterExists: 'Er bestaat al een lijst met deze naam.',
                rosterSaveFailed: 'Opslaan van lijst mislukt. Probeer het opnieuw.',
                rosterDeleteConfirm: 'Weet u zeker dat u de lijst "{{name}}" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.',
                rosterDeleteFailed: 'Verwijderen van lijst mislukt. Probeer het opnieuw.',
                rosterViewEmpty: 'Geen leerlingen in deze lijst.',
                csvNameRequired: 'Vul een naam voor de lijst in.',
                csvFileRequired: 'Kies een CSV-bestand.',
                csvDuplicateName: 'Er bestaat al een lijst met deze naam.',
                csvStructure: 'CSV moet ten minste een koprij en één gegevensrij bevatten.',
                csvMissingName: 'CSV moet een kolom "name" bevatten.',
                csvNoStudents: 'Geen geldige leerlingnamen gevonden in CSV.',
                csvImportFailed: 'CSV importeren mislukt. Controleer het bestandsformaat.',
                seatingPlanRequirements: 'Selecteer zowel een indeling als een leerlingenlijst.',
                seatingPlanNoSeats: 'De gekozen indeling heeft geen stoelen.',
                seatingPlanNoStudents: 'De gekozen lijst bevat geen leerlingen.',
                seatingPlanNotEnoughSeats: 'Niet genoeg stoelen ({{seats}}) voor alle leerlingen ({{students}}).',
                noSeatingPlanToSave: 'Er is geen zitplan om op te slaan.',
                seatingPlanSaveFailed: 'Opslaan van zitplan mislukt. Probeer het opnieuw.',
                seatingRulesSaveFailed: 'Opslaan van zitregels mislukt. Probeer het opnieuw.',
                studentSelectionRequired: 'Selecteer eerst een leerling.',
                studentRulesSaveFailed: 'Opslaan van leerlingregels mislukt. Probeer het opnieuw.',
                studentRulesRemoveFailed: 'Verwijderen van leerlingregels mislukt.',
                seatingRulesError: 'Opslaan van zitregels mislukt. Probeer het opnieuw.'
            },
            info: {
                allStudentsAssigned: 'Alle leerlingen zijn al aan stoelen toegewezen.'
            }
        },
        prompts: {
            layoutOverwrite: 'Er bestaat al een indeling met de naam "{{name}}". <strong>Klik opnieuw op Opslaan om te overschrijven.</strong>',
            rosterDelete: 'Weet u zeker dat u de lijst "{{name}}" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.',
            seatAssignment: 'Huidige stoeltoewijzing: {{current}}\n\nKies een optie:\n',
            seatOptions: {
                remove: 'Leerling verwijderen',
                keep: '{{name}} behouden'
            },
            removeStudentRules: 'Alle regels voor {{name}} verwijderen?',
            seatingPlanName: 'Voer een naam in voor dit zitplan:'
        },
        tables: {
            csv: {
                headerError: 'Fout: CSV moet minimaal een koprij en één gegevensrij bevatten.',
                nameError: 'Fout: CSV moet een kolom "name" bevatten.',
                footerMoreRows: '... en nog {{count}} rijen',
                foundStudents: '✓ {{count}} leerlingen gevonden',
                readError: 'Fout bij het lezen van het CSV-bestand. Controleer het formaat.'
            }
        },
        roster: {
            studentCount: '{{count}} leerlingen',
            previewPrefix: 'Leerlingen:',
            previewMore: '... en nog {{count}} extra',
            actions: {
                edit: 'Bewerken',
                view: 'Bekijken',
                delete: 'Verwijderen'
            }
        },
        planEditor: {
            seatingPlanTitle: 'Zitplan',
            summary: 'Indeling: {{layout}} | Lijst: {{roster}} | Gegenereerd: {{generated}}',
            emptySeat: 'Lege stoel'
        }
    }
};

let currentLanguage = localStorage.getItem('language') || 'en';

function interpolate(template, vars = {}) {
    return template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
        const value = vars[key.trim()];
        return value !== undefined ? value : '';
    });
}

function getTranslationFromObject(obj, path) {
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

function t(key, vars = {}, lang = currentLanguage) {
    const languageData = translations[lang] || translations.en;
    let translation = getTranslationFromObject(languageData, key);

    if (translation === undefined) {
        translation = getTranslationFromObject(translations.en, key);
    }

    if (typeof translation === 'string') {
        return interpolate(translation, vars);
    }

    return key;
}

function applyTranslations() {
    const selectors = [
        '[data-i18n]',
        '[data-i18n-text]',
        '[data-i18n-html]',
        '[data-i18n-placeholder]',
        '[data-i18n-value]',
        '[data-i18n-aria-label]',
        '[data-i18n-title]'
    ];

    const elements = document.querySelectorAll(selectors.join(','));

    elements.forEach((element) => {
        Array.from(element.attributes).forEach((attr) => {
            if (!attr.name.startsWith('data-i18n')) {
                return;
            }

            const translationKey = attr.value;
            if (!translationKey) {
                return;
            }

            const value = t(translationKey);
            if (value === undefined) {
                return;
            }

            switch (attr.name) {
                case 'data-i18n':
                case 'data-i18n-html':
                    element.innerHTML = value;
                    break;
                case 'data-i18n-text':
                    element.textContent = value;
                    break;
                case 'data-i18n-placeholder':
                    element.setAttribute('placeholder', value);
                    if ('placeholder' in element) {
                        element.placeholder = value;
                    }
                    break;
                case 'data-i18n-value':
                    element.setAttribute('value', value);
                    if ('value' in element) {
                        element.value = value;
                    }
                    break;
                case 'data-i18n-aria-label':
                    element.setAttribute('aria-label', value);
                    break;
                case 'data-i18n-title':
                    element.setAttribute('title', value);
                    break;
                default:
                    break;
            }
        });
    });
}

function updateLanguageToggle() {
    const toggle = document.getElementById('language-toggle-label');
    const button = document.getElementById('language-toggle');
    if (!toggle || !button) {
        return;
    }

    if (currentLanguage === 'en') {
        toggle.textContent = 'NL';
        button.setAttribute('aria-label', t('language.toggleToDutch'));
    } else {
        toggle.textContent = 'EN';
        button.setAttribute('aria-label', t('language.toggleToEnglish'));
    }
}

function setLanguage(lang, persist = true) {
    if (!translations[lang]) {
        lang = 'en';
    }

    currentLanguage = lang;

    if (persist) {
        localStorage.setItem('language', currentLanguage);
    }

    document.documentElement.lang = currentLanguage;
    document.title = t('meta.title');
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) {
        descriptionMeta.setAttribute('content', t('meta.description'));
    }

    applyTranslations();
    updateLanguageToggle();

    document.dispatchEvent(new CustomEvent('languagechange', {
        detail: { language: currentLanguage }
    }));
}

function toggleLanguage() {
    const nextLanguage = currentLanguage === 'en' ? 'nl' : 'en';
    setLanguage(nextLanguage);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setLanguage(currentLanguage, false);
    });
} else {
    setLanguage(currentLanguage, false);
}

window.t = t;
window.setLanguage = setLanguage;
window.toggleLanguage = toggleLanguage;
window.applyTranslations = applyTranslations;
window.getCurrentLanguage = () => currentLanguage;
