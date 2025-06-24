from django.db import models

class DimEstudiante(models.Model):
    """Modelo para la dimensión de estudiantes"""
    id_estudiante = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    genero = models.CharField(max_length=20)
    programa_academico = models.CharField(max_length=100)
    semestre_ingreso = models.CharField(max_length=10)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False  # No gestionado por Django
        db_table = 'dim_estudiante'

    def __str__(self):
        return self.nombre


class DimMateria(models.Model):
    """Modelo para la dimensión de materias"""
    id_materia = models.AutoField(primary_key=True)
    nombre_materia = models.CharField(max_length=150)
    creditos = models.IntegerField()
    departamento = models.CharField(max_length=100)
    nivel = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'dim_materia'

    def __str__(self):
        return self.nombre_materia


class DimDocente(models.Model):
    """Modelo para la dimensión de docentes"""
    id_docente = models.AutoField(primary_key=True)
    nombre_docente = models.CharField(max_length=100)
    grado_academico = models.CharField(max_length=50)
    departamento_asignado = models.CharField(max_length=100)
    email = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'dim_docente'

    def __str__(self):
        return self.nombre_docente


class DimTiempo(models.Model):
    """Modelo para la dimensión de tiempo"""
    id_tiempo = models.AutoField(primary_key=True)
    anio = models.IntegerField()
    periodo = models.CharField(max_length=10)
    mes_inicio = models.IntegerField()
    mes_fin = models.IntegerField()
    descripcion = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'dim_tiempo'

    def __str__(self):
        return f"{self.anio} - {self.periodo}"


class DimPrograma(models.Model):
    """Modelo para la dimensión de programas"""
    id_programa = models.AutoField(primary_key=True)
    nombre_programa = models.CharField(max_length=150)
    nivel = models.CharField(max_length=50)
    coordinador = models.CharField(max_length=100, null=True, blank=True)
    facultad = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'dim_programa'

    def __str__(self):
        return self.nombre_programa


class HechosRendimientoAcademico(models.Model):
    """Modelo para la tabla de hechos de rendimiento académico"""
    id_hecho = models.AutoField(primary_key=True)
    id_estudiante = models.ForeignKey(DimEstudiante, on_delete=models.CASCADE, db_column='id_estudiante')
    id_materia = models.ForeignKey(DimMateria, on_delete=models.CASCADE, db_column='id_materia')
    id_docente = models.ForeignKey(DimDocente, on_delete=models.CASCADE, db_column='id_docente')
    id_tiempo = models.ForeignKey(DimTiempo, on_delete=models.CASCADE, db_column='id_tiempo')
    id_programa = models.ForeignKey(DimPrograma, on_delete=models.CASCADE, db_column='id_programa')
    calificacion = models.DecimalField(max_digits=4, decimal_places=2)
    estatus = models.CharField(max_length=20)
    creditos_obtenidos = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'hechos_rendimiento_academico'

    def __str__(self):
        return f"Hecho {self.id_hecho} - {self.estatus}"
