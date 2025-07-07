"""
Motor de Consultas MDX para el Cubo OLAP
Implementa las operaciones básicas: Roll-up, Drill-down, Slice, Dice, Pivot
"""

from typing import Dict, List, Any, Optional
import sqlite3
from .cube_schema import CubeSchema


class MDXEngine:
    """Motor de consultas MDX para análisis multidimensional"""

    def __init__(self, db_connection):
        self.db = db_connection
        self.cube_schema = CubeSchema()
        self.cube_def = self.cube_schema.get_cube_definition()
        self.fact_table = self.cube_def["fact_table"]

    def roll_up(self, dimension: str, from_level: str, to_level: str,
                measures: List[str], filters: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Operación Roll-up: Agrega datos de un nivel detallado a uno más general

        Args:
            dimension: Dimensión sobre la cual hacer roll-up
            from_level: Nivel inicial (más detallado)
            to_level: Nivel final (más general)
            measures: Medidas a agregar
            filters: Filtros opcionales
        """
        try:
            # Obtener jerarquía de la dimensión
            hierarchy = self._get_hierarchy(dimension)

            # Validar niveles
            if from_level not in hierarchy or to_level not in hierarchy:
                raise ValueError(f"Niveles inválidos para la dimensión {dimension}")

            # Construir query SQL
            query = self._build_rollup_query(dimension, from_level, to_level, measures, filters)

            # Ejecutar consulta
            cursor = self.db.cursor()
            cursor.execute(query)
            results = cursor.fetchall()
            columns = [col[0] for col in cursor.description]

            # Convertir resultados a diccionarios
            data = []
            for row in results:
                data.append(dict(zip(columns, row)))

            return {
                "operation": "roll_up",
                "dimension": dimension,
                "from_level": from_level,
                "to_level": to_level,
                "measures": measures,
                "data": data,
                "sql_query": query,
                "mdx_query": self._generate_mdx_rollup(dimension, from_level, to_level, measures, filters)
            }

        except Exception as e:
            return {"error": str(e)}

    def drill_down(self, dimension: str, from_level: str, to_level: str,
                   measures: List[str], filters: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Operación Drill-down: Desagrega datos de un nivel general a uno más detallado
        """
        try:
            hierarchy = self._get_hierarchy(dimension)

            if from_level not in hierarchy or to_level not in hierarchy:
                raise ValueError(f"Niveles inválidos para la dimensión {dimension}")

            query = self._build_drilldown_query(dimension, from_level, to_level, measures, filters)

            cursor = self.db.cursor()
            cursor.execute(query)
            results = cursor.fetchall()
            columns = [col[0] for col in cursor.description]

            # Convertir resultados a diccionarios
            data = []
            for row in results:
                data.append(dict(zip(columns, row)))

            return {
                "operation": "drill_down",
                "dimension": dimension,
                "from_level": from_level,
                "to_level": to_level,
                "measures": measures,
                "data": data,
                "sql_query": query,
                "mdx_query": self._generate_mdx_drilldown(dimension, from_level, to_level, measures, filters)
            }

        except Exception as e:
            return {"error": str(e)}

    def slice_operation(self, fixed_dimension: str, fixed_value: Any,
                       row_dimensions: List[str], col_dimensions: List[str],
                       measures: List[str]) -> Dict[str, Any]:
        """
        Operación Slice: Fija una dimensión en un valor específico
        """
        try:
            query = self._build_slice_query(fixed_dimension, fixed_value,
                                          row_dimensions, col_dimensions, measures)

            cursor = self.db.cursor()
            cursor.execute(query)
            results = cursor.fetchall()
            columns = [col[0] for col in cursor.description]

            # Convertir resultados a diccionarios
            data = []
            for row in results:
                data.append(dict(zip(columns, row)))

            return {
                "operation": "slice",
                "fixed_dimension": fixed_dimension,
                "fixed_value": fixed_value,
                "row_dimensions": row_dimensions,
                "col_dimensions": col_dimensions,
                "measures": measures,
                "data": data,
                "sql_query": query,
                "mdx_query": self._generate_mdx_slice(fixed_dimension, fixed_value,
                                                    row_dimensions, col_dimensions, measures)
            }

        except Exception as e:
            return {"error": str(e)}

    def dice_operation(self, filters: Dict[str, Any],
                      row_dimensions: List[str], col_dimensions: List[str],
                      measures: List[str]) -> Dict[str, Any]:
        """
        Operación Dice: Aplica múltiples filtros a varias dimensiones
        """
        try:
            query = self._build_dice_query(filters, row_dimensions, col_dimensions, measures)

            cursor = self.db.cursor()
            cursor.execute(query)
            results = cursor.fetchall()
            columns = [col[0] for col in cursor.description]

            # Convertir resultados a diccionarios
            data = []
            for row in results:
                data.append(dict(zip(columns, row)))

            return {
                "operation": "dice",
                "filters": filters,
                "row_dimensions": row_dimensions,
                "col_dimensions": col_dimensions,
                "measures": measures,
                "data": data,
                "sql_query": query,
                "mdx_query": self._generate_mdx_dice(filters, row_dimensions, col_dimensions, measures)
            }

        except Exception as e:
            return {"error": str(e)}

    def pivot_operation(self, current_rows: List[str], current_cols: List[str],
                       new_rows: List[str], new_cols: List[str],
                       measures: List[str], filters: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Operación Pivot: Rota las dimensiones entre filas y columnas
        """
        try:
            query = self._build_pivot_query(new_rows, new_cols, measures, filters)

            cursor = self.db.cursor()
            cursor.execute(query)
            results = cursor.fetchall()
            columns = [col[0] for col in cursor.description]

            # Convertir resultados a diccionarios
            data = []
            for row in results:
                data.append(dict(zip(columns, row)))

            return {
                "operation": "pivot",
                "previous_rows": current_rows,
                "previous_cols": current_cols,
                "new_rows": new_rows,
                "new_cols": new_cols,
                "measures": measures,
                "data": data,
                "sql_query": query,
                "mdx_query": self._generate_mdx_pivot(new_rows, new_cols, measures, filters)
            }

        except Exception as e:
            return {"error": str(e)}

    def _get_hierarchy(self, dimension: str) -> List[str]:
        """Obtiene la jerarquía de una dimensión"""
        dim_def = self.cube_def["dimensions"].get(dimension)
        if not dim_def:
            raise ValueError(f"Dimensión {dimension} no encontrada")

        # Retorna la primera jerarquía disponible
        hierarchies = dim_def.get("hierarchies", {})
        if hierarchies:
            return list(hierarchies.values())[0]
        return dim_def.get("attributes", [])

    def _build_rollup_query(self, dimension: str, from_level: str, to_level: str,
                           measures: List[str], filters: Optional[Dict] = None) -> str:
        """Construye consulta SQL para roll-up"""
        dim_table = self.cube_def["dimensions"][dimension]["table"]

        # Construir SELECT con medidas agregadas
        select_parts = [f"{dim_table}.{to_level}"]

        for measure in measures:
            if measure == "calificacion":
                select_parts.extend([
                    f"AVG({self.fact_table}.calificacion) as avg_calificacion",
                    f"SUM({self.fact_table}.calificacion) as sum_calificacion",
                    f"COUNT({self.fact_table}.calificacion) as count_calificacion"
                ])
            elif measure == "creditos_obtenidos":
                select_parts.extend([
                    f"SUM({self.fact_table}.creditos_obtenidos) as sum_creditos",
                    f"AVG({self.fact_table}.creditos_obtenidos) as avg_creditos"
                ])
            elif measure == "estudiantes":
                select_parts.append(f"COUNT(DISTINCT {self.fact_table}.id_estudiante) as count_estudiantes")

        # Construir FROM con JOINs
        from_clause = f"FROM {self.fact_table} JOIN {dim_table} ON {self.fact_table}.{self.cube_def['dimensions'][dimension]['key']} = {dim_table}.{self.cube_def['dimensions'][dimension]['key']}"

        # Agregar otros JOINs necesarios para filtros
        joined_tables = {dim_table}
        if filters:
            for field, value in filters.items():
                if '.' in field:
                    table_alias = field.split('.')[0]
                    # Mapear alias a tabla real
                    table_mapping = {
                        'dim_tiempo': 'dim_tiempo',
                        'dim_estudiante': 'dim_estudiante',
                        'dim_materia': 'dim_materia',
                        'dim_docente': 'dim_docente',
                        'dim_programa': 'dim_programa'
                    }
                    real_table = table_mapping.get(table_alias)
                    if real_table and real_table not in joined_tables:
                        # Encontrar la definición del join
                        for join_def in self.cube_def["joins"]:
                            if join_def["table"] == real_table:
                                from_clause += f" LEFT JOIN {join_def['table']} ON {join_def['on']}"
                                joined_tables.add(real_table)
                                break

        # Construir WHERE
        where_clause = ""
        if filters:
            conditions = []
            for field, value in filters.items():
                conditions.append(f"{field} = '{value}'")
            where_clause = "WHERE " + " AND ".join(conditions)

        # Construir GROUP BY
        group_by = f"GROUP BY {dim_table}.{to_level}"

        return f"SELECT {', '.join(select_parts)} {from_clause} {where_clause} {group_by}"

    def _build_drilldown_query(self, dimension: str, from_level: str, to_level: str,
                              measures: List[str], filters: Optional[Dict] = None) -> str:
        """Construye consulta SQL para drill-down"""
        return self._build_rollup_query(dimension, from_level, to_level, measures, filters)

    def _build_slice_query(self, fixed_dimension: str, fixed_value: Any,
                          row_dimensions: List[str], col_dimensions: List[str],
                          measures: List[str]) -> str:
        """Construye consulta SQL para slice"""
        select_parts = []

        # Agregar dimensiones de filas y columnas
        for dim in row_dimensions + col_dimensions:
            select_parts.append(dim)

        # Agregar medidas
        for measure in measures:
            if measure == "calificacion":
                select_parts.append(f"AVG({self.fact_table}.calificacion) as avg_calificacion")
            elif measure == "creditos_obtenidos":
                select_parts.append(f"SUM({self.fact_table}.creditos_obtenidos) as sum_creditos")

        # FROM con JOINs
        from_clause = f"FROM {self.fact_table}"
        for join in self.cube_def["joins"]:
            from_clause += f" JOIN {join['table']} ON {join['on']}"

        # WHERE para el slice
        where_clause = f"WHERE {fixed_dimension} = '{fixed_value}'"

        # GROUP BY
        group_by = f"GROUP BY {', '.join(row_dimensions + col_dimensions)}" if row_dimensions + col_dimensions else ""

        return f"SELECT {', '.join(select_parts)} {from_clause} {where_clause} {group_by}"

    def _build_dice_query(self, filters: Dict[str, Any],
                         row_dimensions: List[str], col_dimensions: List[str],
                         measures: List[str]) -> str:
        """Construye consulta SQL para dice"""
        select_parts = []

        # Agregar dimensiones
        for dim in row_dimensions + col_dimensions:
            select_parts.append(dim)

        # Agregar medidas
        for measure in measures:
            if measure == "calificacion":
                select_parts.append(f"AVG({self.fact_table}.calificacion) as avg_calificacion")
            elif measure == "creditos_obtenidos":
                select_parts.append(f"SUM({self.fact_table}.creditos_obtenidos) as sum_creditos")

        # FROM con JOINs
        from_clause = f"FROM {self.fact_table}"
        for join in self.cube_def["joins"]:
            from_clause += f" JOIN {join['table']} ON {join['on']}"

        # WHERE con múltiples filtros
        conditions = []
        for field, value in filters.items():
            conditions.append(f"{field} = '{value}'")
        where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""

        # GROUP BY
        group_by = f"GROUP BY {', '.join(row_dimensions + col_dimensions)}" if row_dimensions + col_dimensions else ""

        return f"SELECT {', '.join(select_parts)} {from_clause} {where_clause} {group_by}"

    def _build_pivot_query(self, row_dimensions: List[str], col_dimensions: List[str],
                          measures: List[str], filters: Optional[Dict] = None) -> str:
        """Construye consulta SQL para pivot"""
        return self._build_dice_query(filters or {}, row_dimensions, col_dimensions, measures)

    # Métodos para generar consultas MDX equivalentes
    def _generate_mdx_rollup(self, dimension: str, from_level: str, to_level: str,
                            measures: List[str], filters: Optional[Dict] = None) -> str:
        """Genera consulta MDX para roll-up"""
        measure_list = ", ".join([f"[Measures].[{m}]" for m in measures])
        return f"""
SELECT
    {{{measure_list}}} ON COLUMNS,
    {{[{dimension}].[{to_level}].Members}} ON ROWS
FROM [cubo_academico]
WHERE {self._format_mdx_filters(filters) if filters else ""}
"""

    def _generate_mdx_drilldown(self, dimension: str, from_level: str, to_level: str,
                               measures: List[str], filters: Optional[Dict] = None) -> str:
        """Genera consulta MDX para drill-down"""
        measure_list = ", ".join([f"[Measures].[{m}]" for m in measures])
        return f"""
SELECT
    {{{measure_list}}} ON COLUMNS,
    {{[{dimension}].[{to_level}].Members}} ON ROWS
FROM [cubo_academico]
WHERE {self._format_mdx_filters(filters) if filters else ""}
"""

    def _generate_mdx_slice(self, fixed_dimension: str, fixed_value: Any,
                           row_dimensions: List[str], col_dimensions: List[str],
                           measures: List[str]) -> str:
        """Genera consulta MDX para slice"""
        measure_list = ", ".join([f"[Measures].[{m}]" for m in measures])
        row_dims = " * ".join([f"[{dim}].Members" for dim in row_dimensions])
        col_dims = " * ".join([f"[{dim}].Members" for dim in col_dimensions])

        return f"""
SELECT
    {{{measure_list}}} ON COLUMNS,
    {{{row_dims}}} ON ROWS
FROM [cubo_academico]
WHERE [{fixed_dimension}].[{fixed_value}]
"""

    def _generate_mdx_dice(self, filters: Dict[str, Any],
                          row_dimensions: List[str], col_dimensions: List[str],
                          measures: List[str]) -> str:
        """Genera consulta MDX para dice"""
        measure_list = ", ".join([f"[Measures].[{m}]" for m in measures])
        row_dims = " * ".join([f"[{dim}].Members" for dim in row_dimensions])
        col_dims = " * ".join([f"[{dim}].Members" for dim in col_dimensions])

        return f"""
SELECT
    {{{measure_list}}} ON COLUMNS,
    {{{row_dims}}} ON ROWS
FROM [cubo_academico]
WHERE {self._format_mdx_filters(filters)}
"""

    def _generate_mdx_pivot(self, row_dimensions: List[str], col_dimensions: List[str],
                           measures: List[str], filters: Optional[Dict] = None) -> str:
        """Genera consulta MDX para pivot"""
        measure_list = ", ".join([f"[Measures].[{m}]" for m in measures])
        row_dims = " * ".join([f"[{dim}].Members" for dim in row_dimensions])
        col_dims = " * ".join([f"[{dim}].Members" for dim in col_dimensions])

        return f"""
SELECT
    {{{measure_list}}} ON COLUMNS,
    {{{row_dims}}} ON ROWS
FROM [cubo_academico]
WHERE {self._format_mdx_filters(filters) if filters else ""}
"""

    def _format_mdx_filters(self, filters: Dict[str, Any]) -> str:
        """Formatea filtros para consultas MDX"""
        filter_parts = []
        for field, value in filters.items():
            filter_parts.append(f"[{field}].[{value}]")
        return " AND ".join(filter_parts)
