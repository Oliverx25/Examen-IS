"""
Módulo OLAP para análisis multidimensional
Implementa cubo OLAP y operaciones MDX para el Data Warehouse académico
"""

__version__ = "1.0.0"
__author__ = "Data Warehouse Team"

from .cube_schema import CubeSchema
from .mdx_engine import MDXEngine

__all__ = ['CubeSchema', 'MDXEngine']
