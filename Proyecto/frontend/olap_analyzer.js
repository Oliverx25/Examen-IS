/**
 * Analizador OLAP - JavaScript para operaciones MDX
 * Maneja las operaciones del cubo multidimensional
 */

const API_BASE_URL = 'http://localhost:8000/api';

// Estado global
let cubeSchema = null;
let filterCounters = {
    rollup: 0,
    drilldown: 0,
    dice: 0,
    pivot: 0
};

// Datos para autocomplete
let autocompleteData = {
    dimensions: [],
    attributes: {},
    measures: [],
    operators: ['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'IN'],
    commonValues: {
        'dim_tiempo.anio': ['2020', '2021', '2022', '2023', '2024'],
        'dim_tiempo.periodo': ['2020-1', '2020-2', '2021-1', '2021-2', '2022-1', '2022-2', '2023-1', '2023-2', '2024-1', '2024-2'],
        'dim_estudiante.genero': ['Masculino', 'Femenino'],
        'dim_estudiante.programa_academico': ['Ingeniería en Sistemas Computacionales', 'Ingeniería Industrial', 'Administración de Empresas'],
        'dim_materia.departamento': ['Ingeniería en Sistemas', 'Ciencias Básicas', 'Administración'],
        'dim_materia.nivel': ['Básico', 'Intermedio', 'Avanzado'],
        'dim_programa.nivel': ['Licenciatura', 'Maestría'],
        'dim_programa.facultad': ['Ingeniería', 'Administración', 'Derecho']
    }
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('🧊 Analizador OLAP iniciado');
    loadCubeSchema();
    setupAutocomplete();
});

// =============================================================================
// FUNCIONES DE AUTOCOMPLETE
// =============================================================================

function setupAutocomplete() {
    // Configurar autocomplete después de cargar el esquema
    setTimeout(() => {
        if (cubeSchema) {
            populateAutocompleteData();
            attachAutocompleteToInputs();
        }
    }, 1000);
}

function populateAutocompleteData() {
    if (!cubeSchema) return;

    // Extraer dimensiones
    autocompleteData.dimensions = Object.keys(cubeSchema.dimensions);

    // Extraer atributos por dimensión
    for (const [dimName, dimData] of Object.entries(cubeSchema.dimensions)) {
        autocompleteData.attributes[dimName] = dimData.attributes;
    }

    // Extraer medidas
    autocompleteData.measures = Object.keys(cubeSchema.measures);

    console.log('🎯 Datos de autocomplete cargados:', autocompleteData);
}

function attachAutocompleteToInputs() {
    // Configurar autocomplete para diferentes tipos de inputs
    setupDimensionAutocomplete();
    setupAttributeAutocomplete();
    setupMeasureAutocomplete();
    setupFilterAutocomplete();
}

function setupDimensionAutocomplete() {
    const dimensionSelects = document.querySelectorAll('[id$="-dimension"]');
    dimensionSelects.forEach(select => {
        // Los selects ya tienen las opciones, no necesitan autocomplete
    });
}

function setupAttributeAutocomplete() {
    const attributeInputs = [
        'rollup-from', 'rollup-to',
        'drilldown-from', 'drilldown-to',
        'slice-dimension'
    ];

    attributeInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            createAutocompleteDatalist(input, `${inputId}-datalist`, getAttributeSuggestions());
        }
    });
}

function setupMeasureAutocomplete() {
    const measureInputs = [
        'rollup-measures', 'drilldown-measures', 'slice-measures',
        'dice-measures', 'pivot-measures'
    ];

    measureInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            createAutocompleteDatalist(input, `${inputId}-datalist`, autocompleteData.measures);
        }
    });
}

function setupFilterAutocomplete() {
    // Se configurará dinámicamente cuando se agreguen filtros
}

function createAutocompleteDatalist(input, datalistId, options) {
    // Remover datalist existente si existe
    const existingDatalist = document.getElementById(datalistId);
    if (existingDatalist) {
        existingDatalist.remove();
    }

    // Crear nuevo datalist
    const datalist = document.createElement('datalist');
    datalist.id = datalistId;

    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        datalist.appendChild(optionElement);
    });

    // Agregar al DOM y asociar con el input
    document.body.appendChild(datalist);
    input.setAttribute('list', datalistId);

    // Agregar evento para sugerencias inteligentes
    input.addEventListener('input', function() {
        updateAutocompleteOptions(this, datalistId, options);
    });
}

function updateAutocompleteOptions(input, datalistId, baseOptions) {
    const value = input.value.toLowerCase();
    const datalist = document.getElementById(datalistId);

    if (!datalist) return;

    // Limpiar opciones existentes
    datalist.innerHTML = '';

    // Filtrar y agregar opciones relevantes
    const filteredOptions = baseOptions.filter(option =>
        option.toLowerCase().includes(value)
    );

    filteredOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        datalist.appendChild(optionElement);
    });
}

function getAttributeSuggestions() {
    const suggestions = [];

    // Agregar todos los atributos con prefijo de dimensión
    for (const [dimName, attributes] of Object.entries(autocompleteData.attributes)) {
        attributes.forEach(attr => {
            suggestions.push(`dim_${dimName}.${attr}`);
            suggestions.push(attr); // También agregar sin prefijo
        });
    }

    return suggestions;
}

function getDimensionSuggestions() {
    const suggestions = [];

    autocompleteData.dimensions.forEach(dim => {
        suggestions.push(`dim_${dim}`);
        suggestions.push(dim);
    });

    return suggestions;
}

function getFilterFieldSuggestions() {
    const suggestions = [];

    // Agregar campos comunes de filtros
    for (const [dimName, attributes] of Object.entries(autocompleteData.attributes)) {
        attributes.forEach(attr => {
            suggestions.push(`dim_${dimName}.${attr}`);
        });
    }

    return suggestions;
}

function getFilterValueSuggestions(field) {
    // Retornar valores comunes para campos específicos
    return autocompleteData.commonValues[field] || [];
}

// =============================================================================
// FUNCIONES DE INTERFAZ
// =============================================================================

function toggleOperation(operationId) {
    const body = document.getElementById(operationId + '-body');
    const chevron = document.getElementById(operationId + '-chevron');

    if (body.classList.contains('active')) {
        body.classList.remove('active');
        chevron.classList.remove('rotated');
    } else {
        body.classList.add('active');
        chevron.classList.add('rotated');
    }
}

function showLoading(show) {
    // Implementar indicador de carga si es necesario
    console.log(show ? 'Cargando...' : 'Carga completa');
}

function showToast(message, type = 'info') {
    // Implementar sistema de notificaciones
    console.log(`${type.toUpperCase()}: ${message}`);

    // Crear elemento de notificación simple
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : '#2196f3'};
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// =============================================================================
// GESTIÓN DE FILTROS
// =============================================================================

function addFilter(operation) {
    const container = document.getElementById(operation + '-filters');
    const filterId = operation + '-filter-' + (++filterCounters[operation]);

    const filterRow = document.createElement('div');
    filterRow.className = 'filter-row';
    filterRow.id = filterId;

    filterRow.innerHTML = `
        <input type="text" placeholder="Campo (ej: dim_tiempo.ano)" class="filter-field" list="filter-field-datalist">
        <select class="filter-operator">
            <option value="=">=</option>
            <option value="!=">!=</option>
            <option value=">">></option>
            <option value="<"><</option>
            <option value=">=">>=</option>
            <option value="<="><=</option>
            <option value="LIKE">LIKE</option>
            <option value="IN">IN</option>
        </select>
        <input type="text" placeholder="Valor (ej: 2024)" class="filter-value" list="filter-value-datalist">
        <button type="button" class="remove-filter" onclick="removeFilter('${filterId}')">Eliminar</button>
    `;

    container.appendChild(filterRow);

    // Configurar autocomplete para el nuevo filtro
    setupFilterAutocompleteForRow(filterRow);
}

function setupFilterAutocompleteForRow(filterRow) {
    const fieldInput = filterRow.querySelector('.filter-field');
    const valueInput = filterRow.querySelector('.filter-value');

    // Configurar autocomplete para campo
    createAutocompleteDatalist(fieldInput, 'filter-field-datalist', getFilterFieldSuggestions());

    // Configurar autocomplete dinámico para valor basado en el campo
    fieldInput.addEventListener('change', function() {
        const field = this.value;
        const valueSuggestions = getFilterValueSuggestions(field);
        createAutocompleteDatalist(valueInput, 'filter-value-datalist', valueSuggestions);
    });
}

function removeFilter(filterId) {
    const filterRow = document.getElementById(filterId);
    if (filterRow) {
        filterRow.remove();
    }
}

function collectFilters(operation) {
    const container = document.getElementById(operation + '-filters');
    const filterRows = container.querySelectorAll('.filter-row');
    const filters = {};

    filterRows.forEach(row => {
        const field = row.querySelector('.filter-field').value.trim();
        const operator = row.querySelector('.filter-operator').value;
        const value = row.querySelector('.filter-value').value.trim();

        if (field && value) {
            filters[field] = operator === '=' ? value : `${operator} ${value}`;
        }
    });

    return Object.keys(filters).length > 0 ? filters : null;
}

// =============================================================================
// ESQUEMA DEL CUBO
// =============================================================================

async function loadCubeSchema() {
    try {
        showLoading(true);

        const response = await fetch(`${API_BASE_URL}/olap/schema/`);
        const result = await response.json();

        if (result.success) {
            cubeSchema = result.cube_schema;
            displayCubeSchema(cubeSchema);
            populateAutocompleteData();
            attachAutocompleteToInputs();
            showToast('Esquema del cubo cargado exitosamente', 'success');
        } else {
            throw new Error(result.error || 'Error al cargar esquema');
        }

    } catch (error) {
        console.error('Error loading cube schema:', error);
        showToast('Error al cargar el esquema del cubo: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function displayCubeSchema(schema) {
    const container = document.getElementById('schema-container');

    let html = `
        <div class="schema-tree">
            <h3>📊 ${schema.name}</h3>
            <p><strong>Tabla de Hechos:</strong> ${schema.fact_table}</p>

            <h4>🎯 Dimensiones</h4>
    `;

    // Mostrar dimensiones
    for (const [dimName, dimData] of Object.entries(schema.dimensions)) {
        html += `
            <div class="dimension-item">
                <div class="dimension-title">${dimName.toUpperCase()}</div>
                <p><strong>Tabla:</strong> ${dimData.table}</p>
                <p><strong>Clave:</strong> ${dimData.key}</p>
                <p><strong>Atributos:</strong> ${dimData.attributes.join(', ')}</p>

                <div><strong>Jerarquías:</strong></div>
                <ul>
        `;

        for (const [hierName, hierLevels] of Object.entries(dimData.hierarchies)) {
            html += `<li><strong>${hierName}:</strong> ${hierLevels.join(' → ')}</li>`;
        }

        html += `
                </ul>
            </div>
        `;
    }

    html += `
            <h4>📈 Medidas</h4>
    `;

    // Mostrar medidas
    for (const [measureName, measureData] of Object.entries(schema.measures)) {
        html += `
            <div class="measure-item">
                ${measureName}: ${measureData.description}
                <br><small>Agregaciones: ${measureData.aggregations.join(', ')}</small>
            </div>
        `;
    }

    html += `
        </div>
    `;

    container.innerHTML = html;
}

// =============================================================================
// OPERACIONES OLAP
// =============================================================================

async function executeRollup() {
    try {
        showLoading(true);

        const dimension = document.getElementById('rollup-dimension').value;
        const fromLevel = document.getElementById('rollup-from').value.trim();
        const toLevel = document.getElementById('rollup-to').value.trim();
        const measuresStr = document.getElementById('rollup-measures').value.trim();

        if (!fromLevel || !toLevel || !measuresStr) {
            throw new Error('Todos los campos son requeridos');
        }

        const measures = measuresStr.split(',').map(m => m.trim());
        const filters = collectFilters('rollup');

        const response = await fetch(`${API_BASE_URL}/olap/rollup/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                dimension,
                from_level: fromLevel,
                to_level: toLevel,
                measures,
                filters
            })
        });

        const result = await response.json();

        if (result.success) {
            displayOlapResult('rollup-result', result.result);
            showToast('Roll-up ejecutado exitosamente', 'success');
        } else {
            throw new Error(result.error || 'Error en roll-up');
        }

    } catch (error) {
        console.error('Error executing rollup:', error);
        showToast('Error al ejecutar roll-up: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function executeDrilldown() {
    try {
        showLoading(true);

        const dimension = document.getElementById('drilldown-dimension').value;
        const fromLevel = document.getElementById('drilldown-from').value.trim();
        const toLevel = document.getElementById('drilldown-to').value.trim();
        const measuresStr = document.getElementById('drilldown-measures').value.trim();

        if (!fromLevel || !toLevel || !measuresStr) {
            throw new Error('Todos los campos son requeridos');
        }

        const measures = measuresStr.split(',').map(m => m.trim());
        const filters = collectFilters('drilldown');

        const response = await fetch(`${API_BASE_URL}/olap/drilldown/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                dimension,
                from_level: fromLevel,
                to_level: toLevel,
                measures,
                filters
            })
        });

        const result = await response.json();

        if (result.success) {
            displayOlapResult('drilldown-result', result.result);
            showToast('Drill-down ejecutado exitosamente', 'success');
        } else {
            throw new Error(result.error || 'Error en drill-down');
        }

    } catch (error) {
        console.error('Error executing drilldown:', error);
        showToast('Error al ejecutar drill-down: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function executeSlice() {
    try {
        showLoading(true);

        const fixedDimension = document.getElementById('slice-dimension').value.trim();
        const fixedValue = document.getElementById('slice-value').value.trim();
        const rowDimensionsStr = document.getElementById('slice-rows').value.trim();
        const colDimensionsStr = document.getElementById('slice-cols').value.trim();
        const measuresStr = document.getElementById('slice-measures').value.trim();

        if (!fixedDimension || !fixedValue || !rowDimensionsStr || !measuresStr) {
            throw new Error('Los campos obligatorios son requeridos');
        }

        const rowDimensions = rowDimensionsStr.split(',').map(d => d.trim());
        const colDimensions = colDimensionsStr ? colDimensionsStr.split(',').map(d => d.trim()) : [];
        const measures = measuresStr.split(',').map(m => m.trim());

        const response = await fetch(`${API_BASE_URL}/olap/slice/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fixed_dimension: fixedDimension,
                fixed_value: fixedValue,
                row_dimensions: rowDimensions,
                col_dimensions: colDimensions,
                measures
            })
        });

        const result = await response.json();

        if (result.success) {
            displayOlapResult('slice-result', result.result);
            showToast('Slice ejecutado exitosamente', 'success');
        } else {
            throw new Error(result.error || 'Error en slice');
        }

    } catch (error) {
        console.error('Error executing slice:', error);
        showToast('Error al ejecutar slice: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function executeDice() {
    try {
        showLoading(true);

        const rowDimensionsStr = document.getElementById('dice-rows').value.trim();
        const colDimensionsStr = document.getElementById('dice-cols').value.trim();
        const measuresStr = document.getElementById('dice-measures').value.trim();

        if (!rowDimensionsStr || !measuresStr) {
            throw new Error('Dimensiones en filas y medidas son requeridas');
        }

        const rowDimensions = rowDimensionsStr.split(',').map(d => d.trim());
        const colDimensions = colDimensionsStr ? colDimensionsStr.split(',').map(d => d.trim()) : [];
        const measures = measuresStr.split(',').map(m => m.trim());
        const filters = collectFilters('dice');

        if (!filters) {
            throw new Error('Al menos un filtro es requerido para la operación Dice');
        }

        const response = await fetch(`${API_BASE_URL}/olap/dice/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filters,
                row_dimensions: rowDimensions,
                col_dimensions: colDimensions,
                measures
            })
        });

        const result = await response.json();

        if (result.success) {
            displayOlapResult('dice-result', result.result);
            showToast('Dice ejecutado exitosamente', 'success');
        } else {
            throw new Error(result.error || 'Error en dice');
        }

    } catch (error) {
        console.error('Error executing dice:', error);
        showToast('Error al ejecutar dice: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function executePivot() {
    try {
        showLoading(true);

        const currentRowsStr = document.getElementById('pivot-current-rows').value.trim();
        const currentColsStr = document.getElementById('pivot-current-cols').value.trim();
        const newRowsStr = document.getElementById('pivot-new-rows').value.trim();
        const newColsStr = document.getElementById('pivot-new-cols').value.trim();
        const measuresStr = document.getElementById('pivot-measures').value.trim();

        if (!newRowsStr || !newColsStr || !measuresStr) {
            throw new Error('Nuevas filas, nuevas columnas y medidas son requeridas');
        }

        const currentRows = currentRowsStr ? currentRowsStr.split(',').map(d => d.trim()) : [];
        const currentCols = currentColsStr ? currentColsStr.split(',').map(d => d.trim()) : [];
        const newRows = newRowsStr.split(',').map(d => d.trim());
        const newCols = newColsStr.split(',').map(d => d.trim());
        const measures = measuresStr.split(',').map(m => m.trim());
        const filters = collectFilters('pivot');

        const response = await fetch(`${API_BASE_URL}/olap/pivot/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                current_rows: currentRows,
                current_cols: currentCols,
                new_rows: newRows,
                new_cols: newCols,
                measures,
                filters
            })
        });

        const result = await response.json();

        if (result.success) {
            displayOlapResult('pivot-result', result.result);
            showToast('Pivot ejecutado exitosamente', 'success');
        } else {
            throw new Error(result.error || 'Error en pivot');
        }

    } catch (error) {
        console.error('Error executing pivot:', error);
        showToast('Error al ejecutar pivot: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function executeCustomMDX() {
    try {
        showLoading(true);

        const mdxQuery = document.getElementById('custom-mdx').value.trim();
        const sqlQuery = document.getElementById('custom-sql').value.trim();

        if (!sqlQuery) {
            throw new Error('La consulta SQL equivalente es requerida');
        }

        const response = await fetch(`${API_BASE_URL}/olap/custom-mdx/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mdx_query: mdxQuery,
                sql_equivalent: sqlQuery
            })
        });

        const result = await response.json();

        if (result.success) {
            displayOlapResult('custom-result', result.result);
            showToast('Consulta personalizada ejecutada exitosamente', 'success');
        } else {
            throw new Error(result.error || 'Error en consulta personalizada');
        }

    } catch (error) {
        console.error('Error executing custom MDX:', error);
        showToast('Error al ejecutar consulta personalizada: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// =============================================================================
// VISUALIZACIÓN DE RESULTADOS
// =============================================================================

function displayOlapResult(containerId, result) {
    const container = document.getElementById(containerId);

    let html = `
        <div class="result-container">
            <h4>📊 Resultado de ${result.operation}</h4>
    `;

    // Mostrar información de la operación
    if (result.operation !== 'custom_mdx') {
        html += `
            <div class="operation-info">
                <p><strong>Operación:</strong> ${result.operation}</p>
        `;

        if (result.dimension) {
            html += `<p><strong>Dimensión:</strong> ${result.dimension}</p>`;
        }

        if (result.measures) {
            html += `<p><strong>Medidas:</strong> ${result.measures.join(', ')}</p>`;
        }

        if (result.filters) {
            html += `<p><strong>Filtros:</strong> ${JSON.stringify(result.filters)}</p>`;
        }

        html += `</div>`;
    }

    // Mostrar datos en tabla
    if (result.data && result.data.length > 0) {
        const columns = Object.keys(result.data[0]);

        html += `
            <table class="result-table">
                <thead>
                    <tr>
        `;

        columns.forEach(col => {
            html += `<th>${col}</th>`;
        });

        html += `
                    </tr>
                </thead>
                <tbody>
        `;

        result.data.forEach(row => {
            html += '<tr>';
            columns.forEach(col => {
                let value = row[col];
                if (typeof value === 'number') {
                    value = value.toFixed(2);
                }
                html += `<td>${value || '-'}</td>`;
            });
            html += '</tr>';
        });

        html += `
                </tbody>
            </table>
            <p><strong>Total de registros:</strong> ${result.data.length}</p>
        `;
    } else {
        html += '<p>No se encontraron datos.</p>';
    }

    // Mostrar consulta MDX si está disponible
    if (result.mdx_query) {
        html += `
            <div class="mdx-query">
                <h5>📝 Consulta MDX Generada:</h5>
                <pre>${result.mdx_query}</pre>
            </div>
        `;
    }

    // Mostrar consulta SQL si está disponible
    if (result.sql_query) {
        html += `
            <div class="mdx-query">
                <h5>🔧 Consulta SQL Ejecutada:</h5>
                <pre>${result.sql_query}</pre>
            </div>
        `;
    }

    html += '</div>';

    container.innerHTML = html;
}

// =============================================================================
// FUNCIONES DE EJEMPLO
// =============================================================================

function loadExampleRollup() {
    document.getElementById('rollup-dimension').value = 'estudiante';
    document.getElementById('rollup-from').value = 'nombre';
    document.getElementById('rollup-to').value = 'genero';
    document.getElementById('rollup-measures').value = 'calificacion';

    // Agregar filtro de ejemplo
    addFilter('rollup');
    setTimeout(() => {
        const lastFilter = document.querySelector('#rollup-filters .filter-row:last-child');
        if (lastFilter) {
            lastFilter.querySelector('.filter-field').value = 'dim_tiempo.anio';
            lastFilter.querySelector('.filter-value').value = '2024';
        }
    }, 100);
}

function loadExampleDrilldown() {
    document.getElementById('drilldown-dimension').value = 'materia';
    document.getElementById('drilldown-from').value = 'departamento';
    document.getElementById('drilldown-to').value = 'nombre_materia';
    document.getElementById('drilldown-measures').value = 'calificacion';
}

function loadExampleSlice() {
    document.getElementById('slice-dimension').value = 'dim_tiempo.anio';
    document.getElementById('slice-value').value = '2024';
    document.getElementById('slice-rows').value = 'dim_estudiante.genero';
    document.getElementById('slice-cols').value = 'dim_materia.departamento';
    document.getElementById('slice-measures').value = 'calificacion';
}

function loadExampleDice() {
    document.getElementById('dice-rows').value = 'dim_materia.departamento';
    document.getElementById('dice-cols').value = 'dim_estudiante.genero';
    document.getElementById('dice-measures').value = 'calificacion';

    // Agregar filtros de ejemplo
    addFilter('dice');
    addFilter('dice');
    setTimeout(() => {
        const filters = document.querySelectorAll('#dice-filters .filter-row');
        if (filters[0]) {
            filters[0].querySelector('.filter-field').value = 'dim_tiempo.anio';
            filters[0].querySelector('.filter-value').value = '2024';
        }
        if (filters[1]) {
            filters[1].querySelector('.filter-field').value = 'dim_estudiante.genero';
            filters[1].querySelector('.filter-value').value = 'Masculino';
        }
    }, 100);
}

function loadExamplePivot() {
    document.getElementById('pivot-current-rows').value = 'dim_estudiante.genero';
    document.getElementById('pivot-current-cols').value = 'dim_materia.departamento';
    document.getElementById('pivot-new-rows').value = 'dim_materia.departamento';
    document.getElementById('pivot-new-cols').value = 'dim_estudiante.genero';
    document.getElementById('pivot-measures').value = 'calificacion';
}

function loadExampleCustomMDX() {
    document.getElementById('custom-mdx').value = `SELECT
  {[dim_estudiante].[genero].Members} ON ROWS,
  {[dim_tiempo].[ano].Members} ON COLUMNS
FROM [cubo_academico]
WHERE [Measures].[calificacion]`;

    document.getElementById('custom-sql').value = `SELECT
  e.genero,
  t.ano,
  AVG(h.calificacion) as promedio_calificacion
FROM hechos h
JOIN dim_estudiante e ON h.id_estudiante = e.id_estudiante
JOIN dim_tiempo t ON h.id_tiempo = t.id_tiempo
GROUP BY e.genero, t.ano`;
}

// Agregar botones de ejemplo si es necesario
document.addEventListener('DOMContentLoaded', function() {
    // Agregar tooltips o ayuda contextual si es necesario
    console.log('🎯 Analizador OLAP listo para usar');
});
