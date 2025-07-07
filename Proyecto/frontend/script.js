// Configuración global
const API_BASE_URL = 'http://localhost:8000/api';

// Estado de la aplicación
let currentSection = 'dashboard';
let currentEditData = null;
let currentDimensionName = null;
let currentPage = 1;
let totalPages = 1;
let allDimensionData = [];

// Estado para análisis con paginación
let currentAnalysisPage = 1;
let totalAnalysisPages = 1;
let allAnalysisData = [];
let currentAnalysisType = null;

// Estado para hechos
let currentHechosPage = 1;
let totalHechosPages = 1;
let allHechosData = [];

// Elementos del DOM
let elements = {};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    showSection('dashboard');
    loadDashboardData();
    loadFormData();
    loadAutocompleteOptions(); // Cargar datos de autocomplete
});

function initializeElements() {
    elements = {
        navButtons: document.querySelectorAll('.nav-btn'),
        sections: document.querySelectorAll('.content-section'),
        loading: document.getElementById('loading-spinner'),
        toastContainer: document.getElementById('toast-container'),

        // Dashboard - corregir IDs
        totalRegistros: document.getElementById('total-registros'),
        totalEstudiantes: document.getElementById('total-estudiantes'),
        totalMaterias: document.getElementById('total-materias'),
        totalDocentes: document.getElementById('total-docentes'),
        promedioGeneral: document.getElementById('promedio-general'),
        tasaAprobacion: document.getElementById('tasa-aprobacion'),

        // Data Loading
        dataForm: document.getElementById('load-data-form'),

        // Dimensions
        dimensionContent: document.getElementById('dimension-content'),

        // Hechos
        hechosContent: document.getElementById('hechos-content'),

        // Modals
        editModal: document.getElementById('edit-modal-overlay'),
        editForm: document.getElementById('edit-form'),
        modalTitle: document.getElementById('modal-title'),
        formFields: document.getElementById('form-fields'),

        // Create modals
        createDimensionModal: document.getElementById('create-dimension-modal-overlay'),
        createDimensionForm: document.getElementById('create-dimension-form'),
        createDimensionTitle: document.getElementById('create-dimension-modal-title'),
        createDimensionFields: document.getElementById('create-dimension-form-fields'),

        createHechoModal: document.getElementById('create-hecho-modal-overlay'),
        createHechoForm: document.getElementById('create-hecho-form')
    };
}

function setupEventListeners() {
    // Navegación
    elements.navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            showSection(section);
        });
    });

    // Formulario de datos
    if (elements.dataForm) {
        elements.dataForm.addEventListener('submit', handleDataSubmit);
    }

    // Formulario de edición
    if (elements.editForm) {
        elements.editForm.addEventListener('submit', handleEditSubmit);
    }

    // Formulario de crear dimensión
    if (elements.createDimensionForm) {
        elements.createDimensionForm.addEventListener('submit', handleCreateDimensionSubmit);
    }

    // Formulario de crear hecho
    if (elements.createHechoForm) {
        elements.createHechoForm.addEventListener('submit', handleCreateHechoSubmit);
    }

    // Cerrar modales al hacer clic fuera
    if (elements.editModal) {
        elements.editModal.addEventListener('click', (e) => {
            if (e.target === elements.editModal) {
                closeEditModal();
            }
        });
    }

    if (elements.createDimensionModal) {
        elements.createDimensionModal.addEventListener('click', (e) => {
            if (e.target === elements.createDimensionModal) {
                closeCreateDimensionModal();
            }
        });
    }

    if (elements.createHechoModal) {
        elements.createHechoModal.addEventListener('click', (e) => {
            if (e.target === elements.createHechoModal) {
                closeCreateHechoModal();
            }
        });
    }
}

function showSection(sectionName) {
    // Actualizar navegación
    elements.navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === sectionName);
    });

    // Mostrar sección
    elements.sections.forEach(section => {
        section.classList.toggle('active', section.id === sectionName);
    });

    currentSection = sectionName;

    // Cargar datos específicos de la sección
    if (sectionName === 'dashboard') {
        loadDashboardData();
    } else if (sectionName === 'load-data') {
        loadFormData();
    } else if (sectionName === 'hechos') {
        loadHechosData();
    }
}

// FUNCIONES DEL DASHBOARD
async function loadDashboardData() {
    try {
        showLoading(true);

        const response = await fetch(`${API_BASE_URL}/analytics/dashboard/`);
        const data = await response.json();

        if (response.ok && data.resumen_general) {
            updateDashboardStats(data.resumen_general);
            showToast('Dashboard actualizado correctamente', 'success');
        } else {
            throw new Error('Error en la respuesta del servidor');
        }

    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Error al cargar el dashboard', 'error');
    } finally {
        showLoading(false);
    }
}

function updateDashboardStats(stats) {
    if (elements.totalRegistros) elements.totalRegistros.textContent = stats.total_registros?.toLocaleString() || '-';
    if (elements.totalEstudiantes) elements.totalEstudiantes.textContent = stats.total_estudiantes?.toLocaleString() || '-';
    if (elements.totalMaterias) elements.totalMaterias.textContent = stats.total_materias?.toLocaleString() || '-';
    if (elements.totalDocentes) elements.totalDocentes.textContent = stats.total_docentes?.toLocaleString() || '-';
    if (elements.promedioGeneral) elements.promedioGeneral.textContent = stats.promedio_general || '-';
    if (elements.tasaAprobacion) elements.tasaAprobacion.textContent = stats.tasa_aprobacion ? `${stats.tasa_aprobacion}%` : '-';
}

// FUNCIONES DE ANALYTICS
async function loadTasaReprobacion(page = 1) {
    try {
        showLoading(true);
        currentAnalysisPage = page;
        currentAnalysisType = 'tasa-reprobacion';

        const response = await fetch(`${API_BASE_URL}/analytics/tasa-reprobacion/`);
        const data = await response.json();

        if (response.ok) {
            allAnalysisData = data.data || [];
            totalAnalysisPages = Math.ceil(allAnalysisData.length / 10); // 10 registros por página

            displayAnalysisResults(allAnalysisData, 'Tasas de Reprobación por Materia y Carrera', page);
            showToast('Análisis de reprobación completado', 'success');
        } else {
            throw new Error('Error en la respuesta del servidor');
        }

    } catch (error) {
        console.error('Error running analytics:', error);
        showToast('Error al ejecutar el análisis', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadMateriasSobresalientes(page = 1) {
    try {
        showLoading(true);
        currentAnalysisPage = page;
        currentAnalysisType = 'materias-sobresalientes';

        const response = await fetch(`${API_BASE_URL}/analytics/materias-sobresalientes/`);
        const data = await response.json();

        if (response.ok) {
            allAnalysisData = data.data || [];
            totalAnalysisPages = Math.ceil(allAnalysisData.length / 10); // 10 registros por página

            displayAnalysisResults(allAnalysisData, 'Materias con Calificaciones Sobresalientes', page);
            showToast('Análisis de materias sobresalientes completado', 'success');
        } else {
            throw new Error('Error en la respuesta del servidor');
        }

    } catch (error) {
        console.error('Error running analytics:', error);
        showToast('Error al ejecutar el análisis', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadEvolucionPromedio(page = 1) {
    try {
        showLoading(true);
        currentAnalysisPage = page;
        currentAnalysisType = 'evolucion-promedio';

        const response = await fetch(`${API_BASE_URL}/analytics/evolucion-promedio/`);
        const data = await response.json();

        if (response.ok) {
            allAnalysisData = data.data || [];
            totalAnalysisPages = Math.ceil(allAnalysisData.length / 10); // 10 registros por página

            displayAnalysisResults(allAnalysisData, 'Evolución del Promedio General', page);
            showToast('Análisis de evolución completado', 'success');
        } else {
            throw new Error('Error en la respuesta del servidor');
        }

    } catch (error) {
        console.error('Error running analytics:', error);
        showToast('Error al ejecutar el análisis', 'error');
    } finally {
        showLoading(false);
    }
}

function displayAnalysisResults(data, title, page) {
    const resultsArea = document.getElementById('analysis-results-area');
    const startIndex = (page - 1) * 10;
    const endIndex = startIndex + 10;
    const pageData = data.slice(startIndex, endIndex);

    if (pageData.length === 0) {
        resultsArea.innerHTML = `
            <div class="placeholder-message">
                <i class="fas fa-chart-bar"></i>
                <h3>No hay datos para mostrar</h3>
                <p>No se encontraron resultados para este análisis</p>
            </div>
        `;
        return;
    }

    const table = createAnalysisTable(pageData, data.length, page);
    resultsArea.innerHTML = `
        <div class="analysis-content">
            <h4><i class="fas fa-chart-bar"></i> ${title}</h4>
            ${table}
        </div>
    `;
}

function createAnalysisTable(data, totalRecords, page) {
    if (data.length === 0) return '<p>No hay datos para mostrar</p>';

    const headers = Object.keys(data[0]);
    const headerRow = headers.map(header => `<th>${formatHeader(header)}</th>`).join('');
    const dataRows = data.map(row => {
        const cells = headers.map(header => `<td>${formatCellValue(row[header])}</td>`);
        return `<tr>${cells.join('')}</tr>`;
    }).join('');

    const pagination = generateAnalysisPageNumbers(page, totalAnalysisPages);

    return `
        <div class="pagination-container">
            <div class="pagination-info">
                <p>Mostrando ${((page - 1) * 10) + 1} a ${Math.min(page * 10, totalRecords)} de ${totalRecords} registros</p>
            </div>
            <div class="results-table-container">
                <table class="results-table">
                    <thead>
                        <tr>${headerRow}</tr>
                    </thead>
                    <tbody>${dataRows}</tbody>
                </table>
            </div>
            ${pagination}
        </div>
    `;
}

function generateAnalysisPageNumbers(currentPage, totalPages) {
    if (totalPages <= 1) return '';

    let pagination = '<div class="pagination">';

    // Botón anterior
    pagination += `<button onclick="loadAnalysis('${currentAnalysisType}', ${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i> Anterior
    </button>`;

    // Botón primera página
    if (currentPage > 3) {
        pagination += `<button onclick="loadAnalysis('${currentAnalysisType}', 1)">1</button>`;
        if (currentPage > 4) {
            pagination += `<span>...</span>`;
        }
    }

    // Números de página
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        pagination += `<button onclick="loadAnalysis('${currentAnalysisType}', ${i})" ${i === currentPage ? 'class="active"' : ''}>${i}</button>`;
    }

    // Botón última página
    if (currentPage < totalPages - 2) {
        if (currentPage < totalPages - 3) {
            pagination += `<span>...</span>`;
        }
        pagination += `<button onclick="loadAnalysis('${currentAnalysisType}', ${totalPages})">${totalPages}</button>`;
    }

    // Botón siguiente
    pagination += `<button onclick="loadAnalysis('${currentAnalysisType}', ${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
        Siguiente <i class="fas fa-chevron-right"></i>
    </button>`;

    pagination += '</div>';
    return pagination;
}

function loadAnalysis(analysisType, page) {
    if (page < 1 || page > totalAnalysisPages) return;

    switch (analysisType) {
        case 'tasa-reprobacion':
            loadTasaReprobacion(page);
            break;
        case 'materias-sobresalientes':
            loadMateriasSobresalientes(page);
            break;
        case 'evolucion-promedio':
            loadEvolucionPromedio(page);
            break;
    }
}

function formatHeader(header) {
    return header
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function formatCellValue(value) {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'number') return value.toLocaleString();
    return value.toString();
}

// FUNCIONES DE CARGA DE DATOS
async function loadFormData() {
    try {
        showLoading(true);

        // Cargar datos para los autocompletes
        const [estudiantes, materias, docentes, programas, tiempos] = await Promise.all([
            fetch(`${API_BASE_URL}/dimension/estudiante/`).then(r => r.json()),
            fetch(`${API_BASE_URL}/dimension/materia/`).then(r => r.json()),
            fetch(`${API_BASE_URL}/dimension/docente/`).then(r => r.json()),
            fetch(`${API_BASE_URL}/dimension/programa/`).then(r => r.json()),
            fetch(`${API_BASE_URL}/dimension/tiempo/`).then(r => r.json())
        ]);

        // Guardar datos en el estado global
        autocompleteData.estudiantes = estudiantes.results || estudiantes;
        autocompleteData.materias = materias.results || materias;
        autocompleteData.docentes = docentes.results || docentes;
        autocompleteData.programas = programas.results || programas;
        autocompleteData.tiempos = tiempos.results || tiempos;

        // Configurar autocompletes del formulario principal
        setupAutocomplete('id_estudiante', autocompleteData.estudiantes, 'id_estudiante', 'nombre');
        setupAutocomplete('id_materia', autocompleteData.materias, 'id_materia', 'nombre_materia');
        setupAutocomplete('id_docente', autocompleteData.docentes, 'id_docente', 'nombre_docente');
        setupAutocomplete('id_programa', autocompleteData.programas, 'id_programa', 'nombre_programa');
        setupAutocomplete('id_tiempo', autocompleteData.tiempos, 'id_tiempo', 'periodo');

    } catch (error) {
        console.error('Error loading form data:', error);
        showToast('Error al cargar datos del formulario', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadHechoModalData() {
    try {
        // Siempre cargar datos frescos del servidor para asegurar que aparezcan los registros más recientes
        const [estudiantes, materias, docentes, programas, tiempos] = await Promise.all([
            fetch(`${API_BASE_URL}/dimension/estudiante/`).then(r => r.json()),
            fetch(`${API_BASE_URL}/dimension/materia/`).then(r => r.json()),
            fetch(`${API_BASE_URL}/dimension/docente/`).then(r => r.json()),
            fetch(`${API_BASE_URL}/dimension/programa/`).then(r => r.json()),
            fetch(`${API_BASE_URL}/dimension/tiempo/`).then(r => r.json())
        ]);

        // Actualizar datos en el estado global
        autocompleteData.estudiantes = estudiantes.results || estudiantes;
        autocompleteData.materias = materias.results || materias;
        autocompleteData.docentes = docentes.results || docentes;
        autocompleteData.programas = programas.results || programas;
        autocompleteData.tiempos = tiempos.results || tiempos;

        // Configurar autocompletes del modal de hechos (con prefijo create_)
        setupAutocomplete('create_id_estudiante', autocompleteData.estudiantes, 'id_estudiante', 'nombre');
        setupAutocomplete('create_id_materia', autocompleteData.materias, 'id_materia', 'nombre_materia');
        setupAutocomplete('create_id_docente', autocompleteData.docentes, 'id_docente', 'nombre_docente');
        setupAutocomplete('create_id_programa', autocompleteData.programas, 'id_programa', 'nombre_programa');
        setupAutocomplete('create_id_tiempo', autocompleteData.tiempos, 'id_tiempo', 'periodo');

    } catch (error) {
        console.error('Error loading hecho modal data:', error);
        showToast('Error al cargar datos del modal', 'error');
    }
}

// FUNCIONES DE AUTOCOMPLETE
function setupAutocomplete(fieldId, data, valueField, textField) {
    const searchInput = document.getElementById(fieldId + '_search');
    const hiddenInput = document.getElementById(fieldId);
    const dropdown = document.getElementById(fieldId + '_dropdown');

    if (!searchInput || !hiddenInput || !dropdown) return;

    let selectedIndex = -1;
    let filteredData = [];

    // Evento de entrada de texto
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();

        if (query.length === 0) {
            hideDropdown();
            hiddenInput.value = '';
            return;
        }

        // Filtrar datos
        filteredData = data.filter(item =>
            item[textField].toLowerCase().includes(query)
        );

        showDropdown(filteredData, valueField, textField);
        selectedIndex = -1;
    });

    // Evento de teclas
    searchInput.addEventListener('keydown', function(e) {
        const options = dropdown.querySelectorAll('.autocomplete-option:not(.no-results)');

        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, options.length - 1);
                updateSelection(options);
                break;
            case 'ArrowUp':
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                updateSelection(options);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && options[selectedIndex]) {
                    selectOption(options[selectedIndex]);
                }
                break;
            case 'Escape':
                hideDropdown();
                break;
        }
    });

    // Evento de pérdida de foco
    searchInput.addEventListener('blur', function() {
        // Delay para permitir clics en las opciones
        setTimeout(() => {
            hideDropdown();
        }, 200);
    });

    function showDropdown(items, valueField, textField) {
        dropdown.innerHTML = '';

        if (items.length === 0) {
            dropdown.innerHTML = '<div class="autocomplete-option no-results">No se encontraron resultados</div>';
        } else {
            items.forEach(item => {
                const option = document.createElement('div');
                option.className = 'autocomplete-option';
                option.textContent = item[textField];
                option.dataset.value = item[valueField];
                option.dataset.text = item[textField];

                option.addEventListener('click', function() {
                    selectOption(this);
                });

                dropdown.appendChild(option);
            });
        }

        dropdown.classList.add('show');
    }

    function hideDropdown() {
        dropdown.classList.remove('show');
        selectedIndex = -1;
    }

    function updateSelection(options) {
        options.forEach((option, index) => {
            option.classList.toggle('selected', index === selectedIndex);
        });
    }

    function selectOption(option) {
        searchInput.value = option.dataset.text;
        hiddenInput.value = option.dataset.value;
        hideDropdown();
    }
}

async function handleDataSubmit(event) {
    event.preventDefault();

    try {
        showLoading(true);

        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        const response = await fetch(`${API_BASE_URL}/load-data/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            showToast('Datos cargados exitosamente', 'success');
            event.target.reset();
            loadDashboardData(); // Actualizar dashboard
        } else {
            throw new Error(result.error || 'Error al cargar datos');
        }

    } catch (error) {
        console.error('Error submitting data:', error);
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// FUNCIONES DE DIMENSIONES
async function loadDimension(dimensionName, page = 1) {
    try {
        showLoading(true);
        currentDimensionName = dimensionName;
        currentPage = page;

        const response = await fetch(`${API_BASE_URL}/dimension/${dimensionName}/?page=${page}`);
        const data = await response.json();

        if (response.ok) {
            allDimensionData = data.results || data;
            totalPages = Math.ceil((data.count || allDimensionData.length) / 20);

            displayDimension(dimensionName, allDimensionData, data.count || allDimensionData.length, page);
            showToast(`${dimensionName.charAt(0).toUpperCase() + dimensionName.slice(1)} cargados correctamente`, 'success');
        } else {
            throw new Error('Error en la respuesta del servidor');
        }

    } catch (error) {
        console.error('Error loading dimension:', error);
        showToast('Error al cargar dimensiones', 'error');
    } finally {
        showLoading(false);
    }
}

function displayDimension(dimensionName, data, totalRecords, page) {
    const dimensionContent = document.getElementById('dimension-content');
    const table = createDimensionTable(data, page);

    dimensionContent.innerHTML = `
        <div class="dimension-header">
            <h3>${dimensionName.charAt(0).toUpperCase() + dimensionName.slice(1)}</h3>
            <p>Total: ${totalRecords} registros</p>
        </div>
        ${table}
    `;
}

function createDimensionTable(data, page) {
    if (data.length === 0) {
        return '<p class="text-center">No hay datos para mostrar</p>';
    }

    const headers = Object.keys(data[0]).filter(key => key !== 'created_at');
    const headerRow = headers.map(header => `<th>${formatHeader(header)}</th>`).join('');

    const dataRows = data.map(row => {
        const cells = headers.map(header => `<td>${formatCellValue(row[header])}</td>`);
        const idField = getIdField(currentDimensionName);
        const idValue = row[idField];

        cells.push(`
            <td>
                <button class="edit-btn" onclick="openEditModal('${currentDimensionName}', ${idValue})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="delete-btn" onclick="deleteDimension('${currentDimensionName}', ${idValue})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </td>
        `);

        return `<tr>${cells.join('')}</tr>`;
    }).join('');

    const pagination = generatePageNumbers(page, totalPages);

    return `
        <div class="pagination-container">
            <div class="pagination-info">
                <p>Mostrando ${((page - 1) * 20) + 1} a ${Math.min(page * 20, data.length)} de ${data.length} registros</p>
            </div>
            <div class="results-table-container">
                <table class="results-table">
                    <thead>
                        <tr>${headerRow}<th>Acciones</th></tr>
                    </thead>
                    <tbody>${dataRows}</tbody>
                </table>
            </div>
            ${pagination}
        </div>
    `;
}

function generatePageNumbers(currentPage, totalPages) {
    if (totalPages <= 1) return '';

    let pagination = '<div class="pagination">';

    // Botón anterior
    pagination += `<button onclick="loadDimension('${currentDimensionName}', ${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i> Anterior
    </button>`;

    // Botón primera página
    if (currentPage > 3) {
        pagination += `<button onclick="loadDimension('${currentDimensionName}', 1)">1</button>`;
        if (currentPage > 4) {
            pagination += `<span>...</span>`;
        }
    }

    // Números de página
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        pagination += `<button onclick="loadDimension('${currentDimensionName}', ${i})" ${i === currentPage ? 'class="active"' : ''}>${i}</button>`;
    }

    // Botón última página
    if (currentPage < totalPages - 2) {
        if (currentPage < totalPages - 3) {
            pagination += `<span>...</span>`;
        }
        pagination += `<button onclick="loadDimension('${currentDimensionName}', ${totalPages})">${totalPages}</button>`;
    }

    // Botón siguiente
    pagination += `<button onclick="loadDimension('${currentDimensionName}', ${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
        Siguiente <i class="fas fa-chevron-right"></i>
    </button>`;

    pagination += '</div>';
    return pagination;
}

function getIdField(dimensionName) {
    const idFields = {
        'estudiante': 'id_estudiante',
        'materia': 'id_materia',
        'docente': 'id_docente',
        'programa': 'id_programa',
        'tiempo': 'id_tiempo'
    };
    return idFields[dimensionName];
}

function getFieldConfig(dimensionName) {
    const configs = {
        'estudiante': {
            fields: ['nombre', 'genero', 'programa_academico', 'semestre_ingreso', 'fecha_nacimiento'],
            labels: ['Nombre', 'Género', 'Programa Académico', 'Semestre de Ingreso', 'Fecha de Nacimiento'],
            types: ['text', 'autocomplete', 'autocomplete', 'autocomplete', 'date'],
            autocompleteTypes: [null, 'generos', 'programas', 'semestres', null]
        },
        'materia': {
            fields: ['nombre_materia', 'creditos', 'departamento', 'nivel'],
            labels: ['Nombre de la Materia', 'Créditos', 'Departamento', 'Nivel'],
            types: ['text', 'number', 'autocomplete', 'autocomplete'],
            autocompleteTypes: [null, null, 'departamentos', 'niveles_materia']
        },
        'docente': {
            fields: ['nombre_docente', 'grado_academico', 'departamento_asignado', 'email'],
            labels: ['Nombre del Docente', 'Grado Académico', 'Departamento Asignado', 'Email'],
            types: ['text', 'autocomplete', 'autocomplete', 'email'],
            autocompleteTypes: [null, 'grados_academicos', 'departamentos', null]
        },
        'programa': {
            fields: ['nombre_programa', 'nivel', 'coordinador', 'facultad'],
            labels: ['Nombre del Programa', 'Nivel', 'Coordinador', 'Facultad'],
            types: ['text', 'autocomplete', 'autocomplete', 'autocomplete'],
            autocompleteTypes: [null, 'niveles_programa', 'coordinadores', 'facultades']
        },
        'tiempo': {
            fields: ['anio', 'periodo', 'mes_inicio', 'mes_fin', 'descripcion'],
            labels: ['Año', 'Periodo', 'Mes de Inicio', 'Mes de Fin', 'Descripción'],
            types: ['number', 'text', 'number', 'number', 'text'],
            autocompleteTypes: [null, null, null, null, null]
        }
    };
    return configs[dimensionName];
}

// FUNCIONES DE CRUD PARA DIMENSIONES

// CREATE
async function openCreateDimensionModal(dimensionName) {
    currentDimensionName = dimensionName;
    const config = getFieldConfig(dimensionName);

    elements.createDimensionTitle.innerHTML = `<i class="fas fa-plus"></i> Crear Nuevo ${dimensionName.charAt(0).toUpperCase() + dimensionName.slice(1)}`;

    // Asegurar que tenemos los datos de autocomplete
    await loadAutocompleteOptions();

    const fieldsHTML = config.fields.map((field, index) => {
        const required = field !== 'email' && field !== 'descripcion' && field !== 'coordinador' && field !== 'facultad' ? 'required' : '';
        const fieldType = config.types[index];
        const autocompleteType = config.autocompleteTypes[index];

        if (fieldType === 'autocomplete') {
            return generateAutocompleteField(`create_${field}`, config.labels[index], autocompleteType, required);
        } else {
            return `
                <div class="form-group">
                    <label for="create_${field}">${config.labels[index]}</label>
                    <input type="${fieldType}" id="create_${field}" name="${field}" ${required}>
                </div>
            `;
        }
    }).join('');

    elements.createDimensionFields.innerHTML = fieldsHTML;

    // Configurar autocompletes después de insertar el HTML
    config.fields.forEach((field, index) => {
        if (config.types[index] === 'autocomplete') {
            const autocompleteType = config.autocompleteTypes[index];
            setupDimensionAutocomplete(`create_${field}`, autocompleteType);
        }
    });

    elements.createDimensionModal.classList.add('show');
}

async function handleCreateDimensionSubmit(event) {
    event.preventDefault();

    try {
        showLoading(true);

        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        // Convertir campos numéricos
        const config = getFieldConfig(currentDimensionName);
        config.fields.forEach((field, index) => {
            if (config.types[index] === 'number') {
                data[field] = parseInt(data[field]) || 0;
            }
        });

        const response = await fetch(`${API_BASE_URL}/dimension/${currentDimensionName}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            showToast(`${currentDimensionName.charAt(0).toUpperCase() + currentDimensionName.slice(1)} creado exitosamente`, 'success');
            closeCreateDimensionModal();
            loadDimension(currentDimensionName, 1); // Recargar la lista

            // Recargar datos del autocomplete para que aparezcan inmediatamente
            await reloadAutocompleteData();

        } else {
            throw new Error(result.error || 'Error al crear el registro');
        }

    } catch (error) {
        console.error('Error creating dimension:', error);
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Función para cerrar modal de creación de dimensión
function closeCreateDimensionModal() {
    elements.createDimensionModal.classList.remove('show');
    elements.createDimensionForm.reset();

    // Limpiar autocompletes si existen
    const config = getFieldConfig(currentDimensionName);
    if (config) {
        config.fields.forEach((field, index) => {
            if (config.types[index] === 'autocomplete') {
                clearAutocomplete(`create_${field}`);
            }
        });
    }
}

// UPDATE
async function openEditModal(dimensionName, recordId) {
    try {
        showLoading(true);
        currentDimensionName = dimensionName;
        currentEditData = { id: recordId };

        const response = await fetch(`${API_BASE_URL}/dimension/${dimensionName}/${recordId}/`);
        const data = await response.json();

        if (response.ok) {
            const config = getFieldConfig(dimensionName);

            elements.modalTitle.innerHTML = `<i class="fas fa-edit"></i> Editar ${dimensionName.charAt(0).toUpperCase() + dimensionName.slice(1)}`;

            // Asegurar que tenemos los datos de autocomplete
            await loadAutocompleteOptions();

            const fieldsHTML = config.fields.map((field, index) => {
                const value = data[field] || '';
                const required = field !== 'email' && field !== 'descripcion' && field !== 'coordinador' && field !== 'facultad' ? 'required' : '';
                const fieldType = config.types[index];
                const autocompleteType = config.autocompleteTypes[index];

                if (fieldType === 'autocomplete') {
                    return generateAutocompleteField(`edit_${field}`, config.labels[index], autocompleteType, required, value);
                } else {
                    return `
                        <div class="form-group">
                            <label for="edit_${field}">${config.labels[index]}</label>
                            <input type="${fieldType}" id="edit_${field}" name="${field}" value="${value}" ${required}>
                        </div>
                    `;
                }
            }).join('');

            elements.formFields.innerHTML = fieldsHTML;

            // Configurar autocompletes después de insertar el HTML
            config.fields.forEach((field, index) => {
                if (config.types[index] === 'autocomplete') {
                    const autocompleteType = config.autocompleteTypes[index];
                    setupDimensionAutocomplete(`edit_${field}`, autocompleteType);

                    // Establecer el valor inicial
                    const value = data[field] || '';
                    if (value) {
                        setAutocompleteValue(`edit_${field}`, value, value);
                    }
                }
            });

            elements.editModal.classList.add('show');
        } else {
            throw new Error('Error al cargar datos para editar');
        }

    } catch (error) {
        console.error('Error opening edit modal:', error);
        showToast('Error al cargar datos para editar', 'error');
    } finally {
        showLoading(false);
    }
}

async function handleEditSubmit(event) {
    event.preventDefault();

    try {
        showLoading(true);

        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        // Convertir campos numéricos
        const config = getFieldConfig(currentDimensionName);
        config.fields.forEach((field, index) => {
            if (config.types[index] === 'number') {
                data[field] = parseInt(data[field]) || 0;
            }
        });

        const response = await fetch(`${API_BASE_URL}/dimension/${currentDimensionName}/${currentEditData.id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            showToast(`${currentDimensionName.charAt(0).toUpperCase() + currentDimensionName.slice(1)} actualizado exitosamente`, 'success');
            closeEditModal();
            loadDimension(currentDimensionName, currentPage); // Recargar la lista

            // Recargar datos del autocomplete para que se actualicen los nombres
            await reloadAutocompleteData();

        } else {
            throw new Error(result.error || 'Error al actualizar el registro');
        }

    } catch (error) {
        console.error('Error updating dimension:', error);
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Función para cerrar modal de edición
function closeEditModal() {
    elements.editModal.classList.remove('show');
    elements.editForm.reset();
    currentEditData = null;

    // Limpiar autocompletes si existen
    const config = getFieldConfig(currentDimensionName);
    if (config) {
        config.fields.forEach((field, index) => {
            if (config.types[index] === 'autocomplete') {
                clearAutocomplete(`edit_${field}`);
            }
        });
    }
}

// DELETE
async function deleteDimension(dimensionName, recordId) {
    if (!confirm(`¿Estás seguro de que quieres eliminar este ${dimensionName}?`)) {
        return;
    }

    try {
        showLoading(true);

        const response = await fetch(`${API_BASE_URL}/dimension/${dimensionName}/${recordId}/delete/`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast(`${dimensionName.charAt(0).toUpperCase() + dimensionName.slice(1)} eliminado exitosamente`, 'success');
            loadDimension(dimensionName, currentPage); // Recargar la lista

            // Recargar datos del autocomplete para que se actualicen
            await reloadAutocompleteData();

        } else {
            const result = await response.json();
            throw new Error(result.error || 'Error al eliminar el registro');
        }

    } catch (error) {
        console.error('Error deleting dimension:', error);
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// FUNCIONES DE HECHOS
async function loadHechosData(page = 1) {
    try {
        showLoading(true);
        currentHechosPage = page;

        const response = await fetch(`${API_BASE_URL}/hechos/?page=${page}`);
        const data = await response.json();

        if (response.ok) {
            allHechosData = data.results || data;
            totalHechosPages = Math.ceil((data.count || allHechosData.length) / 20);

            displayHechos(allHechosData, data.count || allHechosData.length, page);
            showToast('Tabla de hechos cargada correctamente', 'success');
        } else {
            throw new Error('Error en la respuesta del servidor');
        }

    } catch (error) {
        console.error('Error loading hechos:', error);
        showToast('Error al cargar la tabla de hechos', 'error');
    } finally {
        showLoading(false);
    }
}

function displayHechos(data, totalRecords, page) {
    const hechosContent = document.getElementById('hechos-content');
    const table = createHechosTable(data, page);

    hechosContent.innerHTML = `
        <div class="hechos-header">
            <h3>Registros de Rendimiento Académico</h3>
            <p>Total: ${totalRecords} registros</p>
        </div>
        ${table}
    `;
}

function createHechosTable(data, page) {
    if (data.length === 0) {
        return '<p class="text-center">No hay datos para mostrar</p>';
    }

    const headers = ['ID', 'Estudiante', 'Materia', 'Docente', 'Periodo', 'Programa', 'Calificación', 'Estatus', 'Créditos'];
    const headerRow = headers.map(header => `<th>${header}</th>`).join('');

    const dataRows = data.map(row => {
        const cells = [
            row.id_hecho,
            row.id_estudiante_nombre || `ID: ${row.id_estudiante}`,
            row.id_materia_nombre_materia || `ID: ${row.id_materia}`,
            row.id_docente_nombre_docente || `ID: ${row.id_docente}`,
            row.id_tiempo_periodo || `ID: ${row.id_tiempo}`,
            row.id_programa_nombre_programa || `ID: ${row.id_programa}`,
            row.calificacion,
            row.estatus,
            row.creditos_obtenidos
        ].map(cell => `<td>${formatCellValue(cell)}</td>`);

        cells.push(`
            <td>
                <button class="edit-btn" onclick="openEditHechoModal(${row.id_hecho})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="delete-btn" onclick="deleteHecho(${row.id_hecho})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </td>
        `);

        return `<tr>${cells.join('')}</tr>`;
    }).join('');

    const pagination = generateHechosPageNumbers(page, totalHechosPages);

    return `
        <div class="pagination-container">
            <div class="pagination-info">
                <p>Mostrando ${((page - 1) * 20) + 1} a ${Math.min(page * 20, data.length)} de ${data.length} registros</p>
            </div>
            <div class="results-table-container">
                <table class="results-table">
                    <thead>
                        <tr>${headerRow}<th>Acciones</th></tr>
                    </thead>
                    <tbody>${dataRows}</tbody>
                </table>
            </div>
            ${pagination}
        </div>
    `;
}

function generateHechosPageNumbers(currentPage, totalPages) {
    if (totalPages <= 1) return '';

    let pagination = '<div class="pagination">';

    // Botón anterior
    pagination += `<button onclick="loadHechosData(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i> Anterior
    </button>`;

    // Botón primera página
    if (currentPage > 3) {
        pagination += `<button onclick="loadHechosData(1)">1</button>`;
        if (currentPage > 4) {
            pagination += `<span>...</span>`;
        }
    }

    // Números de página
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        pagination += `<button onclick="loadHechosData(${i})" ${i === currentPage ? 'class="active"' : ''}>${i}</button>`;
    }

    // Botón última página
    if (currentPage < totalPages - 2) {
        if (currentPage < totalPages - 3) {
            pagination += `<span>...</span>`;
        }
        pagination += `<button onclick="loadHechosData(${totalPages})">${totalPages}</button>`;
    }

    // Botón siguiente
    pagination += `<button onclick="loadHechosData(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
        Siguiente <i class="fas fa-chevron-right"></i>
    </button>`;

    pagination += '</div>';
    return pagination;
}

function openCreateHechoModal() {
    loadHechoModalData(); // Cargar datos para los selects del modal
    elements.createHechoModal.classList.add('show');
}

async function handleCreateHechoSubmit(event) {
    event.preventDefault();

    try {
        showLoading(true);

        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        // Convertir campos numéricos
        data.calificacion = parseFloat(data.calificacion);
        data.creditos_obtenidos = parseInt(data.creditos_obtenidos);

        const response = await fetch(`${API_BASE_URL}/hechos/create/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            showToast('Hecho creado exitosamente', 'success');
            closeCreateHechoModal();

            // Recargar la tabla de hechos automáticamente
            await loadHechosData(currentHechosPage);

            // Actualizar dashboard
            loadDashboardData();

            // Recargar datos de autocomplete para mantener todo actualizado
            await reloadAutocompleteData();
        } else {
            throw new Error(result.error || 'Error al crear el hecho');
        }

    } catch (error) {
        console.error('Error creating hecho:', error);
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function closeCreateHechoModal() {
    elements.createHechoModal.classList.remove('show');
    elements.createHechoForm.reset();

    // Limpiar autocompletes
    clearAutocomplete('create_id_estudiante');
    clearAutocomplete('create_id_materia');
    clearAutocomplete('create_id_docente');
    clearAutocomplete('create_id_tiempo');
    clearAutocomplete('create_id_programa');

    // Resetear el modal al estado original
    const modalTitle = elements.createHechoModal.querySelector('h3');
    modalTitle.innerHTML = '<i class="fas fa-plus"></i> Crear Nuevo Hecho';

    const submitBtn = elements.createHechoForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Crear Hecho';

    // Resetear el comportamiento del formulario
    elements.createHechoForm.onsubmit = handleCreateHechoSubmit;
    elements.createHechoForm.removeAttribute('data-hecho-id');
}

// Función auxiliar para limpiar autocompletes
function clearAutocomplete(fieldId) {
    const searchInput = document.getElementById(fieldId + '_search');
    const hiddenInput = document.getElementById(fieldId);
    const dropdown = document.getElementById(fieldId + '_dropdown');

    if (searchInput) searchInput.value = '';
    if (hiddenInput) hiddenInput.value = '';
    if (dropdown) dropdown.classList.remove('show');
}

async function openEditHechoModal(hechoId) {
    try {
        showLoading(true);

        const response = await fetch(`${API_BASE_URL}/hechos/${hechoId}/`);
        const data = await response.json();

        if (response.ok) {
            // Cargar datos para los autocompletes del modal
            await loadHechoModalData();

            // Poblar el formulario con los datos correctos
            setAutocompleteValue('create_id_estudiante', data.id_estudiante, data.id_estudiante_nombre);
            setAutocompleteValue('create_id_materia', data.id_materia, data.id_materia_nombre_materia);
            setAutocompleteValue('create_id_docente', data.id_docente, data.id_docente_nombre_docente);
            setAutocompleteValue('create_id_tiempo', data.id_tiempo, data.id_tiempo_periodo);
            setAutocompleteValue('create_id_programa', data.id_programa, data.id_programa_nombre_programa);

            document.getElementById('create_calificacion').value = data.calificacion;
            document.getElementById('create_estatus').value = data.estatus;
            document.getElementById('create_creditos_obtenidos').value = data.creditos_obtenidos;

            // Cambiar el título y comportamiento del modal
            const modalTitle = elements.createHechoModal.querySelector('h3');
            modalTitle.innerHTML = '<i class="fas fa-edit"></i> Editar Hecho';

            // Cambiar el botón de submit
            const submitBtn = elements.createHechoForm.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';

            // Cambiar el comportamiento del formulario
            elements.createHechoForm.onsubmit = handleEditHechoSubmit;
            elements.createHechoForm.dataset.hechoId = hechoId;

            elements.createHechoModal.classList.add('show');
        } else {
            throw new Error('Error al cargar datos para editar');
        }

    } catch (error) {
        console.error('Error opening edit hecho modal:', error);
        showToast('Error al cargar datos para editar', 'error');
    } finally {
        showLoading(false);
    }
}

// Función auxiliar para establecer valores en autocomplete
function setAutocompleteValue(fieldId, value, text) {
    const searchInput = document.getElementById(fieldId + '_search');
    const hiddenInput = document.getElementById(fieldId);

    if (searchInput && hiddenInput && text) {
        searchInput.value = text;
        hiddenInput.value = value;
    }
}

async function handleEditHechoSubmit(event) {
    event.preventDefault();

    try {
        showLoading(true);

        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        const hechoId = event.target.dataset.hechoId;

        // Convertir campos numéricos
        data.calificacion = parseFloat(data.calificacion);
        data.creditos_obtenidos = parseInt(data.creditos_obtenidos);

        const response = await fetch(`${API_BASE_URL}/hechos/${hechoId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            showToast('Hecho actualizado exitosamente', 'success');
            closeCreateHechoModal();

            // Recargar la tabla de hechos automáticamente manteniendo la página actual
            await loadHechosData(currentHechosPage);

            // Actualizar dashboard
            loadDashboardData();

            // Recargar datos de autocomplete para mantener todo actualizado
            await reloadAutocompleteData();
        } else {
            throw new Error(result.error || 'Error al actualizar el hecho');
        }

    } catch (error) {
        console.error('Error updating hecho:', error);
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function deleteHecho(hechoId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este hecho?')) {
        return;
    }

    try {
        showLoading(true);

        const response = await fetch(`${API_BASE_URL}/hechos/${hechoId}/delete/`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('Hecho eliminado exitosamente', 'success');

            // Recargar la tabla de hechos automáticamente
            await loadHechosData(currentHechosPage);

            // Actualizar dashboard
            loadDashboardData();

            // Recargar datos de autocomplete para mantener todo actualizado
            await reloadAutocompleteData();
        } else {
            const result = await response.json();
            throw new Error(result.error || 'Error al eliminar el hecho');
        }

    } catch (error) {
        console.error('Error deleting hecho:', error);
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// FUNCIONES DE FILTRADO MEJORADAS
function filterHechos() {
    const searchTerm = document.getElementById('hechos-search').value.toLowerCase();
    const estatusFilter = document.getElementById('estatus-filter').value;
    const calificacionMin = parseFloat(document.getElementById('calificacion-min').value) || 0;
    const calificacionMax = parseFloat(document.getElementById('calificacion-max').value) || 100;

    const rows = document.querySelectorAll('.data-table tbody tr');
    let visibleCount = 0;

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length > 0) {
            const estudiante = cells[1].textContent.toLowerCase();
            const materia = cells[2].textContent.toLowerCase();
            const docente = cells[3].textContent.toLowerCase();
            const programa = cells[5].textContent.toLowerCase();
            const calificacion = parseFloat(cells[6].textContent);
            const estatus = cells[7].textContent;

            const matchesSearch = estudiante.includes(searchTerm) ||
                                materia.includes(searchTerm) ||
                                docente.includes(searchTerm) ||
                                programa.includes(searchTerm);

            const matchesEstatus = !estatusFilter || estatus === estatusFilter;
            const matchesCalificacion = calificacion >= calificacionMin && calificacion <= calificacionMax;

            if (matchesSearch && matchesEstatus && matchesCalificacion) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        }
    });

    // Actualizar contador si existe
    const counter = document.querySelector('.results-info');
    if (counter) {
        counter.textContent = `Mostrando ${visibleCount} registros`;
    }
}

// FUNCIONES UTILITARIAS
function showLoading(show) {
    const spinner = document.getElementById('loading-spinner');
    spinner.style.display = show ? 'flex' : 'none';
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${getToastIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => container.removeChild(toast), 300);
    }, 3000);
}

function getToastIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// Función para recargar datos de autocomplete después de operaciones CRUD
async function reloadAutocompleteData() {
    try {
        await Promise.all([
            loadFormData(),
            loadHechoModalData(),
            loadAutocompleteOptions()
        ]);
    } catch (error) {
        console.error('Error reloading autocomplete data:', error);
    }
}

// Estado global para datos de autocomplete
let autocompleteData = {
    estudiantes: [],
    materias: [],
    docentes: [],
    programas: [],
    tiempos: [],
    generos: [],
    semestres: [],
    departamentos: [],
    niveles_materia: [],
    grados_academicos: [],
    niveles_programa: [],
    facultades: [],
    coordinadores: []
};

// Función para cargar datos de autocomplete
async function loadAutocompleteOptions() {
    try {
        const endpoints = [
            { key: 'generos', url: `${API_BASE_URL}/autocomplete/generos/` },
            { key: 'semestres', url: `${API_BASE_URL}/autocomplete/semestres/` },
            { key: 'departamentos', url: `${API_BASE_URL}/autocomplete/departamentos/` },
            { key: 'niveles_materia', url: `${API_BASE_URL}/autocomplete/niveles-materia/` },
            { key: 'grados_academicos', url: `${API_BASE_URL}/autocomplete/grados-academicos/` },
            { key: 'niveles_programa', url: `${API_BASE_URL}/autocomplete/niveles-programa/` },
            { key: 'facultades', url: `${API_BASE_URL}/autocomplete/facultades/` },
            { key: 'coordinadores', url: `${API_BASE_URL}/autocomplete/coordinadores/` }
        ];

        const responses = await Promise.all(
            endpoints.map(endpoint => fetch(endpoint.url))
        );

        const data = await Promise.all(
            responses.map(response => response.json())
        );

        endpoints.forEach((endpoint, index) => {
            autocompleteData[endpoint.key] = data[index];
        });

    } catch (error) {
        console.error('Error loading autocomplete options:', error);
    }
}

// Función para generar campos de autocomplete
function generateAutocompleteField(fieldId, label, autocompleteType, required = '', initialValue = '') {
    return `
        <div class="form-group">
            <label for="${fieldId}">${label}</label>
            <div class="autocomplete-container">
                <input type="text" id="${fieldId}_search" placeholder="Buscar ${label.toLowerCase()}..." autocomplete="off" value="${initialValue}">
                <input type="hidden" id="${fieldId}" name="${fieldId.replace('create_', '').replace('edit_', '')}" ${required} value="${initialValue}">
                <div class="autocomplete-dropdown" id="${fieldId}_dropdown"></div>
            </div>
        </div>
    `;
}

// Función para configurar autocompletes en formularios de dimensiones
function setupDimensionAutocomplete(fieldId, autocompleteType) {
    let data = [];
    let valueField = 'value';
    let textField = 'label';

    // Obtener datos según el tipo
    switch (autocompleteType) {
        case 'generos':
            data = autocompleteData.generos;
            break;
        case 'semestres':
            data = autocompleteData.semestres;
            break;
        case 'departamentos':
            data = autocompleteData.departamentos;
            break;
        case 'niveles_materia':
            data = autocompleteData.niveles_materia;
            break;
        case 'grados_academicos':
            data = autocompleteData.grados_academicos;
            break;
        case 'niveles_programa':
            data = autocompleteData.niveles_programa;
            break;
        case 'facultades':
            data = autocompleteData.facultades;
            break;
        case 'coordinadores':
            data = autocompleteData.coordinadores;
            break;
        case 'programas':
            data = autocompleteData.programas;
            valueField = 'nombre_programa';
            textField = 'nombre_programa';
            break;
    }

    setupAutocomplete(fieldId, data, valueField, textField);
}

// Función para crear un nuevo registro
async function createRecord(formData) {
    try {
        showLoading(true);

        const response = await fetch(`${API_BASE_URL}/dimension/${currentDimensionName}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Registro creado exitosamente', 'success');
            closeCreateDimensionModal();
            loadDimensionData(currentDimensionName);

            // Recargar datos de autocomplete
            await loadAutocompleteOptions();

            // Recargar datos para el formulario principal si es necesario
            if (['estudiantes', 'materias', 'docentes', 'tiempos', 'programas'].includes(currentDimensionName)) {
                loadFormData();
                loadHechoModalData();
            }
        } else {
            throw new Error(data.message || 'Error al crear el registro');
        }

    } catch (error) {
        console.error('Error creating record:', error);
        showToast('Error al crear el registro: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Función para actualizar un registro existente
async function updateRecord(formData) {
    try {
        showLoading(true);

        const response = await fetch(`${API_BASE_URL}/dimension/${currentDimensionName}/${currentEditData.id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Registro actualizado exitosamente', 'success');
            closeEditModal();
            loadDimensionData(currentDimensionName);

            // Recargar datos de autocomplete
            await loadAutocompleteOptions();

            // Recargar datos para el formulario principal si es necesario
            if (['estudiantes', 'materias', 'docentes', 'tiempos', 'programas'].includes(currentDimensionName)) {
                loadFormData();
                loadHechoModalData();
            }
        } else {
            throw new Error(data.message || 'Error al actualizar el registro');
        }

    } catch (error) {
        console.error('Error updating record:', error);
        showToast('Error al actualizar el registro: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}
