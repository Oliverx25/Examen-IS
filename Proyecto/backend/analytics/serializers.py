from rest_framework import serializers
from .models import (
    DimEstudiante, DimMateria, DimDocente, DimTiempo,
    DimPrograma, HechosRendimientoAcademico
)

class DimEstudianteSerializer(serializers.ModelSerializer):
    """Serializer para la dimensión de estudiantes"""
    class Meta:
        model = DimEstudiante
        fields = '__all__'


class DimMateriaSerializer(serializers.ModelSerializer):
    """Serializer para la dimensión de materias"""
    class Meta:
        model = DimMateria
        fields = '__all__'


class DimDocenteSerializer(serializers.ModelSerializer):
    """Serializer para la dimensión de docentes"""
    class Meta:
        model = DimDocente
        fields = '__all__'


class DimTiempoSerializer(serializers.ModelSerializer):
    """Serializer para la dimensión de tiempo"""
    class Meta:
        model = DimTiempo
        fields = '__all__'


class DimProgramaSerializer(serializers.ModelSerializer):
    """Serializer para la dimensión de programas"""
    class Meta:
        model = DimPrograma
        fields = '__all__'


class HechosRendimientoAcademicoSerializer(serializers.ModelSerializer):
    """Serializer para la tabla de hechos"""
    # Campos relacionados para mostrar información completa
    id_estudiante_nombre = serializers.CharField(source='id_estudiante.nombre', read_only=True)
    id_materia_nombre_materia = serializers.CharField(source='id_materia.nombre_materia', read_only=True)
    id_docente_nombre_docente = serializers.CharField(source='id_docente.nombre_docente', read_only=True)
    id_tiempo_periodo = serializers.CharField(source='id_tiempo.periodo', read_only=True)
    id_programa_nombre_programa = serializers.CharField(source='id_programa.nombre_programa', read_only=True)

    class Meta:
        model = HechosRendimientoAcademico
        fields = '__all__'


class LoadDataSerializer(serializers.Serializer):
    """Serializer para cargar nuevos datos al Data Warehouse"""
    id_estudiante = serializers.IntegerField()
    id_materia = serializers.IntegerField()
    id_docente = serializers.IntegerField()
    id_tiempo = serializers.IntegerField()
    id_programa = serializers.IntegerField()
    calificacion = serializers.DecimalField(max_digits=4, decimal_places=2)
    estatus = serializers.ChoiceField(choices=[
        ('Aprobado', 'Aprobado'),
        ('Reprobado', 'Reprobado'),
        ('Extraordinario', 'Extraordinario')
    ])
    creditos_obtenidos = serializers.IntegerField(default=0)

    def validate_calificacion(self, value):
        """Validar que la calificación esté en el rango correcto"""
        if value < 0 or value > 100:
            raise serializers.ValidationError("La calificación debe estar entre 0 y 100.")
        return value


# Serializers para análisis específicos
class TasaReprobacionSerializer(serializers.Serializer):
    """Serializer para análisis de tasas de reprobación"""
    nombre_materia = serializers.CharField()
    departamento = serializers.CharField()
    nombre_programa = serializers.CharField()
    periodo = serializers.CharField()
    total_evaluaciones = serializers.IntegerField()
    reprobados = serializers.IntegerField()
    tasa_reprobacion = serializers.DecimalField(max_digits=5, decimal_places=2)


class MateriasExcelentesSerializer(serializers.Serializer):
    """Serializer para análisis de materias con calificaciones sobresalientes"""
    nombre_materia = serializers.CharField()
    departamento = serializers.CharField()
    total_estudiantes = serializers.IntegerField()
    estudiantes_sobresalientes = serializers.IntegerField()
    porcentaje_sobresalientes = serializers.DecimalField(max_digits=5, decimal_places=2)
    promedio_materia = serializers.DecimalField(max_digits=5, decimal_places=2)


class EvolucionPromedioSerializer(serializers.Serializer):
    """Serializer para análisis de evolución del promedio"""
    anio = serializers.IntegerField()
    periodo = serializers.CharField()
    nombre_programa = serializers.CharField()
    nivel = serializers.CharField()
    promedio_general = serializers.DecimalField(max_digits=5, decimal_places=2)
    total_estudiantes = serializers.IntegerField()
    total_evaluaciones = serializers.IntegerField()
