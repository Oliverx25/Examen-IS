"""
Esquema del Cubo OLAP para el Data Warehouse Académico
"""

from typing import Dict, List, Any

class CubeSchema:
    """
    Definición del esquema del cubo multidimensional para análisis académico
    """

    def __init__(self):
        self.fact_table = "hechos_rendimiento_academico"
        self.dimensions = self._define_dimensions()
        self.measures = self._define_measures()

    def _define_dimensions(self) -> Dict[str, Dict[str, Any]]:
        """Define las dimensiones del cubo"""
        return {
            "estudiante": {
                "table": "dim_estudiante",
                "key": "id_estudiante",
                "attributes": [
                    "nombre",
                    "genero",
                    "programa_academico",
                    "semestre_ingreso",
                    "fecha_nacimiento"
                ],
                "hierarchies": {
                    "demografica": ["genero", "programa_academico", "nombre"],
                    "temporal": ["semestre_ingreso", "nombre"]
                }
            },
            "materia": {
                "table": "dim_materia",
                "key": "id_materia",
                "attributes": [
                    "nombre_materia",
                    "creditos",
                    "departamento",
                    "nivel"
                ],
                "hierarchies": {
                    "academica": ["departamento", "nivel", "nombre_materia"],
                    "creditos": ["creditos", "nombre_materia"]
                }
            },
            "docente": {
                "table": "dim_docente",
                "key": "id_docente",
                "attributes": [
                    "nombre_docente",
                    "grado_academico",
                    "departamento_asignado",
                    "email"
                ],
                "hierarchies": {
                    "academica": ["departamento_asignado", "grado_academico", "nombre_docente"],
                    "grado": ["grado_academico", "nombre_docente"]
                }
            },
            "programa": {
                "table": "dim_programa",
                "key": "id_programa",
                "attributes": [
                    "nombre_programa",
                    "nivel",
                    "coordinador",
                    "facultad"
                ],
                "hierarchies": {
                    "institucional": ["facultad", "nivel", "nombre_programa"],
                    "coordinacion": ["coordinador", "nombre_programa"]
                }
            },
            "tiempo": {
                "table": "dim_tiempo",
                "key": "id_tiempo",
                "attributes": [
                    "anio",
                    "periodo",
                    "mes_inicio",
                    "mes_fin",
                    "descripcion"
                ],
                "hierarchies": {
                    "temporal": ["anio", "periodo", "mes_inicio"],
                    "academica": ["anio", "periodo"]
                }
            }
        }

    def _define_measures(self) -> Dict[str, Dict[str, Any]]:
        """Define las medidas del cubo"""
        return {
            "calificacion": {
                "column": "calificacion",
                "aggregations": ["SUM", "AVG", "MIN", "MAX", "COUNT"],
                "description": "Calificaciones obtenidas por los estudiantes"
            },
            "creditos_obtenidos": {
                "column": "creditos_obtenidos",
                "aggregations": ["SUM", "AVG", "COUNT"],
                "description": "Créditos académicos obtenidos"
            },
            "estudiantes": {
                "column": "id_estudiante",
                "aggregations": ["COUNT", "DISTINCT_COUNT"],
                "description": "Número de estudiantes"
            },
            "materias": {
                "column": "id_materia",
                "aggregations": ["COUNT", "DISTINCT_COUNT"],
                "description": "Número de materias"
            }
        }

    def get_cube_definition(self) -> Dict[str, Any]:
        """Retorna la definición completa del cubo"""
        return {
            "name": "cubo_academico",
            "fact_table": self.fact_table,
            "dimensions": self.dimensions,
            "measures": self.measures,
            "joins": self._define_joins()
        }

    def _define_joins(self) -> List[Dict[str, str]]:
        """Define las uniones entre la tabla de hechos y las dimensiones"""
        return [
            {
                "table": "dim_estudiante",
                "on": f"{self.fact_table}.id_estudiante = dim_estudiante.id_estudiante"
            },
            {
                "table": "dim_materia",
                "on": f"{self.fact_table}.id_materia = dim_materia.id_materia"
            },
            {
                "table": "dim_docente",
                "on": f"{self.fact_table}.id_docente = dim_docente.id_docente"
            },
            {
                "table": "dim_programa",
                "on": f"{self.fact_table}.id_programa = dim_programa.id_programa"
            },
            {
                "table": "dim_tiempo",
                "on": f"{self.fact_table}.id_tiempo = dim_tiempo.id_tiempo"
            }
        ]

    def get_schema_info(self) -> Dict[str, Any]:
        """Retorna información estructurada del esquema para la API"""
        return {
            "success": True,
            "cube_schema": {
                "name": "DataWarehouse_Academico",
                "fact_table": self.fact_table,
                "dimensions": self.dimensions,
                "measures": self.measures
            }
        }
