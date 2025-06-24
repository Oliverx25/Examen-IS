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

// Elementos del DOM
let elements = {};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    showSection('dashboard');
    loadDashboardData();
    loadFormData();
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

        // Modal
        editModal: document.getElementById('edit-modal-overlay'),
        editForm: document.getElementById('edit-form'),
        modalTitle: document.getElementById('modal-title'),
        formFields: document.getElementById('form-fields')
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

    // Cerrar modal al hacer clic fuera
    if (elements.editModal) {
        elements.editModal.addEventListener('click', (e) => {
            if (e.target === elements.editModal) {
                closeEditModal();
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

            displayAnalysisResults(allAnalysisData, 'Evolución del Promedio por Programa', page);
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
    const container = document.getElementById('analysis-results-area');
    if (!container) return;

    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="analysis-content">
                <h4><i class="fas fa-chart-line"></i> ${title}</h4>
                <div class="text-center text-muted">
                    <p>No se encontraron datos para mostrar</p>
                </div>
            </div>
        `;
        return;
    }

    const startIndex = (page - 1) * 10;
    const endIndex = startIndex + 10;
    const pageData = data.slice(startIndex, endIndex);

    const table = createAnalysisTable(pageData, data.length, page);
    container.innerHTML = `
        <div class="analysis-content">
            <h4><i class="fas fa-chart-line"></i> ${title}</h4>
            ${table}
        </div>
    `;
}

function createAnalysisTable(data, totalRecords, page) {
    if (!data || data.length === 0) return '<p>No hay datos disponibles</p>';

    const headers = Object.keys(data[0]);

    const tableHTML = `
        <div class="results-container">
            <table class="results-table">
                <thead>
                    <tr>
                        ${headers.map(header => `<th>${formatHeader(header)}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${data.map(row => `
                        <tr>
                            ${headers.map(header => `<td>${formatCellValue(row[header])}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            ${totalRecords > 10 ? `<p class="text-muted text-center">Mostrando 10 de ${totalRecords} registros</p>` : ''}
        </div>
    `;

    // Agregar controles de paginación si hay más de una página
    const paginationHTML = totalAnalysisPages > 1 ? `
        <div class="pagination-container">
            <div class="pagination-info">
                <p class="text-muted">Página ${page} de ${totalAnalysisPages}</p>
            </div>
            <div class="pagination-controls">
                <button class="btn btn-secondary" onclick="loadAnalysis('${currentAnalysisType}', ${page - 1})" ${page <= 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i> Anterior
                </button>
                <span class="pagination-numbers">
                    ${generateAnalysisPageNumbers(page, totalAnalysisPages)}
                </span>
                <button class="btn btn-secondary" onclick="loadAnalysis('${currentAnalysisType}', ${page + 1})" ${page >= totalAnalysisPages ? 'disabled' : ''}>
                    Siguiente <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    ` : '';

    return tableHTML + paginationHTML;
}

function generateAnalysisPageNumbers(currentPage, totalPages) {
    let pageNumbers = '';
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Ajustar startPage si estamos cerca del final
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Agregar primera página si no está visible
    if (startPage > 1) {
        pageNumbers += `<button class="pagination-btn" onclick="loadAnalysis('${currentAnalysisType}', 1)">1</button>`;
        if (startPage > 2) {
            pageNumbers += '<span class="pagination-dots">...</span>';
        }
    }

    // Agregar páginas visibles
    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPage ? 'active' : '';
        pageNumbers += `<button class="pagination-btn ${isActive}" onclick="loadAnalysis('${currentAnalysisType}', ${i})">${i}</button>`;
    }

    // Agregar última página si no está visible
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pageNumbers += '<span class="pagination-dots">...</span>';
        }
        pageNumbers += `<button class="pagination-btn" onclick="loadAnalysis('${currentAnalysisType}', ${totalPages})">${totalPages}</button>`;
    }

    return pageNumbers;
}

// Función helper para cargar análisis
function loadAnalysis(analysisType, page) {
    switch(analysisType) {
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
    const headerMap = {
        'nombre_materia': 'Materia',
        'departamento': 'Departamento',
        'nombre_programa': 'Programa',
        'periodo': 'Periodo',
        'total_evaluaciones': 'Total Evaluaciones',
        'reprobados': 'Reprobados',
        'tasa_reprobacion': 'Tasa Reprobación (%)',
        'total_estudiantes': 'Total Estudiantes',
        'estudiantes_sobresalientes': 'Estudiantes Sobresalientes',
        'porcentaje_sobresalientes': 'Porcentaje Sobresalientes (%)',
        'promedio_materia': 'Promedio Materia',
        'anio': 'Año',
        'promedio_general': 'Promedio General',
        'nivel': 'Nivel',
        'total_evaluaciones': 'Total Evaluaciones'
    };
    return headerMap[header] || header.charAt(0).toUpperCase() + header.slice(1).replace('_', ' ');
}

function formatCellValue(value) {
    if (typeof value === 'number' && value % 1 !== 0) {
        return value.toFixed(2);
    }
    return value;
}

// FUNCIONES DE CARGA DE DATOS
async function loadFormData() {
    try {
        // Cargar datos para los selects del formulario
        const [estudiantes, materias, docentes, tiempos, programas] = await Promise.all([
            fetch(`${API_BASE_URL}/dimension/estudiante/`).then(r => r.json()),
            fetch(`${API_BASE_URL}/dimension/materia/`).then(r => r.json()),
            fetch(`${API_BASE_URL}/dimension/docente/`).then(r => r.json()),
            fetch(`${API_BASE_URL}/dimension/tiempo/`).then(r => r.json()),
            fetch(`${API_BASE_URL}/dimension/programa/`).then(r => r.json())
        ]);

        populateSelect('id_estudiante', estudiantes.results || estudiantes, 'id_estudiante', 'nombre');
        populateSelect('id_materia', materias.results || materias, 'id_materia', 'nombre_materia');
        populateSelect('id_docente', docentes.results || docentes, 'id_docente', 'nombre_docente');
        populateSelect('id_tiempo', tiempos.results || tiempos, 'id_tiempo', 'descripcion');
        populateSelect('id_programa', programas.results || programas, 'id_programa', 'nombre_programa');

    } catch (error) {
        console.error('Error loading form data:', error);
        showToast('Error al cargar datos del formulario', 'error');
    }
}

function populateSelect(selectId, data, valueField, textField) {
    const select = document.getElementById(selectId);
    if (!select || !data) return;

    // Limpiar opciones existentes excepto la primera
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }

    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueField];
        option.textContent = item[textField];
        select.appendChild(option);
    });
}

async function handleDataSubmit(event) {
    event.preventDefault();

    try {
        showLoading(true);

        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);

        // Convertir strings a números donde sea necesario
        data.id_estudiante = parseInt(data.id_estudiante);
        data.id_materia = parseInt(data.id_materia);
        data.id_docente = parseInt(data.id_docente);
        data.id_tiempo = parseInt(data.id_tiempo);
        data.id_programa = parseInt(data.id_programa);
        data.calificacion = parseFloat(data.calificacion);
        data.creditos_obtenidos = parseInt(data.creditos_obtenidos);

        const response = await fetch(`${API_BASE_URL}/load-data/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            showToast('Datos cargados exitosamente', 'success');
            event.target.reset();

            // Actualizar dashboard si estamos en esa sección
            if (currentSection === 'dashboard') {
                setTimeout(() => loadDashboardData(), 1000);
            }
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error en la respuesta del servidor');
        }

    } catch (error) {
        console.error('Error submitting data:', error);
        showToast(`Error al cargar datos: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

// FUNCIONES DE DIMENSIONES
async function loadDimension(dimensionName, page = 1) {
    try {
        showLoading(true);
        currentPage = page;

        const response = await fetch(`${API_BASE_URL}/dimension/${dimensionName}/?page=${page}`);
        const data = await response.json();

        if (response.ok) {
            // Actualizar información de paginación
            allDimensionData = data.results || data;

            if (data.count) {
                totalPages = Math.ceil(data.count / 20); // 20 es el page_size
            } else {
                totalPages = 1;
            }

            displayDimension(dimensionName, allDimensionData, data.count || allDimensionData.length, page);
        } else {
            throw new Error('Error al cargar dimensión');
        }

    } catch (error) {
        console.error('Error loading dimension:', error);
        showToast('Error al cargar la dimensión', 'error');
    } finally {
        showLoading(false);
    }
}

function displayDimension(dimensionName, data, totalRecords, page) {
    if (!elements.dimensionContent) return;

    // Guardar el nombre de la dimensión actual
    currentDimensionName = dimensionName;

    const dimensionTitles = {
        'estudiante': 'Dimensión: Estudiantes',
        'materia': 'Dimensión: Materias',
        'docente': 'Dimensión: Docentes',
        'programa': 'Dimensión: Programas',
        'tiempo': 'Dimensión: Periodos de Tiempo'
    };

    const title = dimensionTitles[dimensionName] || 'Dimensión';

    elements.dimensionContent.innerHTML = `
        <h3><i class="fas fa-table"></i> ${title}</h3>
        <p class="text-muted">Total de registros: ${totalRecords}</p>
        ${createDimensionTable(data, page)}
    `;
}

function createDimensionTable(data, page) {
    if (!data || data.length === 0) {
        return '<p class="text-muted">No hay datos disponibles</p>';
    }

    const headers = Object.keys(data[0]).filter(key => !key.includes('created_at'));
    const idField = getIdField(currentDimensionName);

    const tableHTML = `
        <div class="results-container">
            <table class="results-table">
                <thead>
                    <tr>
                        ${headers.map(header => `<th>${formatHeader(header)}</th>`).join('')}
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(row => `
                        <tr>
                            ${headers.map(header => `<td>${row[header] || '-'}</td>`).join('')}
                            <td>
                                <button class="edit-btn" onclick="openEditModal('${currentDimensionName}', ${row[idField]})">
                                    <i class="fas fa-edit"></i> Editar
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    // Agregar controles de paginación si hay más de una página
    const paginationHTML = totalPages > 1 ? `
        <div class="pagination-container">
            <div class="pagination-info">
                <p class="text-muted">Página ${page} de ${totalPages}</p>
            </div>
            <div class="pagination-controls">
                <button class="btn btn-secondary" onclick="loadDimension('${currentDimensionName}', ${page - 1})" ${page <= 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i> Anterior
                </button>
                <span class="pagination-numbers">
                    ${generatePageNumbers(page, totalPages)}
                </span>
                <button class="btn btn-secondary" onclick="loadDimension('${currentDimensionName}', ${page + 1})" ${page >= totalPages ? 'disabled' : ''}>
                    Siguiente <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    ` : '';

    return tableHTML + paginationHTML;
}

function generatePageNumbers(currentPage, totalPages) {
    let pageNumbers = '';
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Ajustar startPage si estamos cerca del final
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Agregar primera página si no está visible
    if (startPage > 1) {
        pageNumbers += `<button class="pagination-btn" onclick="loadDimension('${currentDimensionName}', 1)">1</button>`;
        if (startPage > 2) {
            pageNumbers += '<span class="pagination-dots">...</span>';
        }
    }

    // Agregar páginas visibles
    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPage ? 'active' : '';
        pageNumbers += `<button class="pagination-btn ${isActive}" onclick="loadDimension('${currentDimensionName}', ${i})">${i}</button>`;
    }

    // Agregar última página si no está visible
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pageNumbers += '<span class="pagination-dots">...</span>';
        }
        pageNumbers += `<button class="pagination-btn" onclick="loadDimension('${currentDimensionName}', ${totalPages})">${totalPages}</button>`;
    }

    return pageNumbers;
}

// FUNCIONES DE EDICIÓN DE DIMENSIONES

function getIdField(dimensionName) {
    const idFields = {
        'estudiante': 'id_estudiante',
        'materia': 'id_materia',
        'docente': 'id_docente',
        'programa': 'id_programa',
        'tiempo': 'id_tiempo'
    };
    return idFields[dimensionName] || 'id';
}

function getFieldConfig(dimensionName) {
    const configs = {
        'estudiante': [
            { field: 'nombre', label: 'Nombre Completo', type: 'text', required: true },
            { field: 'genero', label: 'Género', type: 'select', options: ['Masculino', 'Femenino'], required: true },
            { field: 'programa_academico', label: 'Programa Académico', type: 'text', required: true },
            { field: 'semestre_ingreso', label: 'Semestre de Ingreso', type: 'text', required: true },
            { field: 'fecha_nacimiento', label: 'Fecha de Nacimiento', type: 'date', required: false }
        ],
        'materia': [
            { field: 'nombre_materia', label: 'Nombre de la Materia', type: 'text', required: true },
            { field: 'creditos', label: 'Créditos', type: 'number', required: true },
            { field: 'departamento', label: 'Departamento', type: 'text', required: true },
            { field: 'nivel', label: 'Nivel', type: 'select', options: ['Básico', 'Intermedio', 'Avanzado'], required: true }
        ],
        'docente': [
            { field: 'nombre_docente', label: 'Nombre del Docente', type: 'text', required: true },
            { field: 'grado_academico', label: 'Grado Académico', type: 'select', options: ['Licenciatura', 'Maestría', 'PhD', 'Doctorado'], required: true },
            { field: 'departamento_asignado', label: 'Departamento', type: 'text', required: true },
            { field: 'email', label: 'Email', type: 'email', required: false }
        ],
        'programa': [
            { field: 'nombre_programa', label: 'Nombre del Programa', type: 'text', required: true },
            { field: 'nivel', label: 'Nivel', type: 'select', options: ['Pregrado', 'Postgrado', 'Especialización'], required: true },
            { field: 'coordinador', label: 'Coordinador', type: 'text', required: false },
            { field: 'facultad', label: 'Facultad', type: 'text', required: false }
        ]
    };
    return configs[dimensionName] || [];
}

async function openEditModal(dimensionName, recordId) {
    try {
        showLoading(true);

        // Obtener el registro específico
        const response = await fetch(`${API_BASE_URL}/dimension/${dimensionName}/${recordId}/`);

        if (!response.ok) {
            throw new Error('Error al obtener el registro');
        }

        const record = await response.json();
        currentEditData = record;
        currentDimensionName = dimensionName;

        // Configurar el modal
        const dimensionTitles = {
            'estudiante': 'Estudiante',
            'materia': 'Materia',
            'docente': 'Docente',
            'programa': 'Programa'
        };

        elements.modalTitle.innerHTML = `
            <i class="fas fa-edit"></i> Editar ${dimensionTitles[dimensionName]}
        `;

        // Generar campos del formulario
        generateFormFields(dimensionName, record);

        // Mostrar modal
        elements.editModal.classList.add('show');

    } catch (error) {
        console.error('Error opening edit modal:', error);
        showToast('Error al abrir el formulario de edición', 'error');
    } finally {
        showLoading(false);
    }
}

function generateFormFields(dimensionName, record) {
    const fieldConfig = getFieldConfig(dimensionName);

    let fieldsHTML = '';

    fieldConfig.forEach(config => {
        const value = record[config.field] || '';

        fieldsHTML += `
            <div class="form-group">
                <label for="${config.field}">${config.label}${config.required ? ' *' : ''}</label>
        `;

        if (config.type === 'select') {
            fieldsHTML += `
                <select id="${config.field}" name="${config.field}" ${config.required ? 'required' : ''}>
                    ${config.options.map(option =>
                        `<option value="${option}" ${value === option ? 'selected' : ''}>${option}</option>`
                    ).join('')}
                </select>
            `;
        } else {
            fieldsHTML += `
                <input
                    type="${config.type}"
                    id="${config.field}"
                    name="${config.field}"
                    value="${value}"
                    ${config.required ? 'required' : ''}
                >
            `;
        }

        fieldsHTML += '</div>';
    });

    elements.formFields.innerHTML = fieldsHTML;
}

async function handleEditSubmit(event) {
    event.preventDefault();

    try {
        showLoading(true);

        // Recopilar datos del formulario
        const formData = new FormData(elements.editForm);
        const updateData = {};

        for (const [key, value] of formData.entries()) {
            updateData[key] = value;
        }

        // Obtener ID del registro
        const idField = getIdField(currentDimensionName);
        const recordId = currentEditData[idField];

        // Guardar el nombre de la dimensión antes de cerrar el modal
        const dimensionToReload = currentDimensionName;
        const pageToReload = currentPage;

        // Enviar petición PUT
        const response = await fetch(`${API_BASE_URL}/dimension/${currentDimensionName}/${recordId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Error al actualizar el registro');
        }

        const updatedRecord = await response.json();

        // Cerrar modal
        closeEditModal();

        // Recargar la dimensión manteniendo la página actual
        // Usamos las variables guardadas para evitar el problema del null
        await loadDimension(dimensionToReload, pageToReload);

        showToast('Registro actualizado correctamente', 'success');

    } catch (error) {
        console.error('Error updating record:', error);
        showToast(`Error al actualizar: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

function closeEditModal() {
    elements.editModal.classList.remove('show');
    currentEditData = null;
    currentDimensionName = null;

    // Limpiar formulario
    if (elements.editForm) {
        elements.editForm.reset();
    }

    if (elements.formFields) {
        elements.formFields.innerHTML = '';
    }
}

// FUNCIONES DE UI
function showLoading(show) {
    if (elements.loading) {
        elements.loading.classList.toggle('show', show);
    }
}

function showToast(message, type = 'info') {
    if (!elements.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${getToastIcon(type)}"></i>
        ${message}
    `;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4000);
}

function getToastIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Funciones globales para eventos onclick
window.loadTasaReprobacion = loadTasaReprobacion;
window.loadMateriasSobresalientes = loadMateriasSobresalientes;
window.loadEvolucionPromedio = loadEvolucionPromedio;
window.loadDimension = loadDimension;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.loadAnalysis = loadAnalysis;
