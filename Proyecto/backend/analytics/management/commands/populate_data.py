import random
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.db import transaction
from analytics.models import DimEstudiante, DimMateria, DimDocente, DimTiempo, DimPrograma, HechosRendimientoAcademico
from faker import Faker

fake = Faker('es_ES')

class Command(BaseCommand):
    help = 'Poblar la base de datos con datos de prueba para el Data Warehouse'

    def add_arguments(self, parser):
        parser.add_argument(
            '--registros',
            type=int,
            default=5000,
            help='Número de registros de hechos a crear (default: 5000)'
        )

    def handle(self, *args, **options):
        registros = options['registros']

        self.stdout.write('Iniciando población de datos...')

        # 1. Crear Programas Académicos
        self.stdout.write('Creando programas académicos...')
        programas = []
        nombres_programas = [
            'Ingeniería de Sistemas', 'Ingeniería Industrial', 'Administración de Empresas',
            'Contaduría Pública', 'Ingeniería Civil', 'Medicina', 'Derecho', 'Psicología',
            'Arquitectura', 'Ingeniería Electrónica', 'Marketing', 'Enfermería',
            'Ingeniería Ambiental', 'Comunicación Social', 'Educación', 'Economía',
            'Ingeniería de Alimentos', 'Diseño Gráfico', 'Trabajo Social', 'Fisioterapia'
        ]

        facultades = ['Ingeniería', 'Ciencias Económicas', 'Ciencias de la Salud', 'Ciencias Sociales', 'Arte y Diseño']
        niveles = ['Pregrado', 'Posgrado']

        for i, nombre in enumerate(nombres_programas):
            programa = DimPrograma.objects.create(
                nombre_programa=nombre,
                nivel=random.choice(niveles),
                coordinador=fake.name(),
                facultad=random.choice(facultades)
            )
            programas.append(programa)

        self.stdout.write(f'✓ Creados {len(programas)} programas académicos')

        # 2. Crear Estudiantes
        self.stdout.write('Creando estudiantes...')
        estudiantes = []
        generos = ['Masculino', 'Femenino']
        semestres = ['2021-1', '2021-2', '2022-1', '2022-2', '2023-1', '2023-2', '2024-1']

        for i in range(1000):  # 1000 estudiantes
            estudiante = DimEstudiante.objects.create(
                nombre=fake.name(),
                genero=random.choice(generos),
                programa_academico=random.choice(programas).nombre_programa,
                semestre_ingreso=random.choice(semestres),
                fecha_nacimiento=fake.date_between(start_date='-25y', end_date='-18y')
            )
            estudiantes.append(estudiante)

        self.stdout.write(f'✓ Creados {len(estudiantes)} estudiantes')

        # 3. Crear Materias
        self.stdout.write('Creando materias...')
        materias = []
        departamentos = ['Matemáticas', 'Física', 'Química', 'Sistemas', 'Industrial', 'Civil', 'Humanidades', 'Ciencias Sociales']
        niveles_materia = ['Básico', 'Intermedio', 'Avanzado', 'Especialización']

        nombres_materias = [
            'Cálculo I', 'Cálculo II', 'Álgebra Lineal', 'Física I', 'Física II', 'Química General',
            'Programación I', 'Programación II', 'Base de Datos', 'Sistemas Operativos',
            'Redes de Computadores', 'Ingeniería de Software', 'Investigación de Operaciones',
            'Estadística', 'Probabilidad', 'Economía', 'Contabilidad', 'Finanzas',
            'Marketing', 'Gestión Humana', 'Ética Profesional', 'Constitución Política',
            'Emprendimiento', 'Inglés I', 'Inglés II', 'Comunicación Escrita'
        ] * 6  # Para tener suficientes materias

        for i in range(150):  # 150 materias
            materia = DimMateria.objects.create(
                nombre_materia=nombres_materias[i],
                creditos=random.randint(2, 5),
                departamento=random.choice(departamentos),
                nivel=random.choice(niveles_materia)
            )
            materias.append(materia)

        self.stdout.write(f'✓ Creadas {len(materias)} materias')

        # 4. Crear Docentes
        self.stdout.write('Creando docentes...')
        docentes = []
        grados = ['Licenciatura', 'Especialización', 'Maestría', 'Doctorado']

        for i in range(80):  # 80 docentes
            nombre = fake.name()
            docente = DimDocente.objects.create(
                nombre_docente=nombre,
                grado_academico=random.choice(grados),
                departamento_asignado=random.choice(departamentos),
                email=f"{nombre.lower().replace(' ', '.')}@universidad.edu.co"
            )
            docentes.append(docente)

        self.stdout.write(f'✓ Creados {len(docentes)} docentes')

        # 5. Crear Dimensión Tiempo
        self.stdout.write('Creando períodos de tiempo...')
        tiempos = []

        for anio in range(2021, 2025):
            for periodo_num, periodo_nombre in [(1, 'I'), (2, 'II')]:
                tiempo = DimTiempo.objects.create(
                    anio=anio,
                    periodo=periodo_nombre,
                    mes_inicio=1 if periodo_num == 1 else 8,
                    mes_fin=6 if periodo_num == 1 else 12,
                    descripcion=f"Período {periodo_nombre} del año {anio}"
                )
                tiempos.append(tiempo)

        self.stdout.write(f'✓ Creados {len(tiempos)} períodos de tiempo')

        # 6. Crear Hechos de Rendimiento Académico
        self.stdout.write(f'Creando {registros} registros de rendimiento académico...')

        estatus_options = ['Aprobado', 'Reprobado', 'Extraordinario']
        batch_size = 1000

        for i in range(0, registros, batch_size):
            hechos_batch = []
            current_batch_size = min(batch_size, registros - i)

            for j in range(current_batch_size):
                # Generar calificación realista
                estatus = random.choices(
                    estatus_options,
                    weights=[70, 25, 5],  # 70% aprobados, 25% reprobados, 5% extraordinarios
                    k=1
                )[0]

                if estatus == 'Aprobado':
                    calificacion = round(random.uniform(60.0, 100.0), 2)
                    creditos = random.choice(materias).creditos
                elif estatus == 'Reprobado':
                    calificacion = round(random.uniform(0.0, 59.9), 2)
                    creditos = 0
                else:  # Extraordinario
                    calificacion = round(random.uniform(60.0, 79.9), 2)
                    creditos = random.choice(materias).creditos

                hecho = HechosRendimientoAcademico(
                    id_estudiante=random.choice(estudiantes),
                    id_materia=random.choice(materias),
                    id_docente=random.choice(docentes),
                    id_tiempo=random.choice(tiempos),
                    id_programa=random.choice(programas),
                    calificacion=calificacion,
                    estatus=estatus,
                    creditos_obtenidos=creditos
                )
                hechos_batch.append(hecho)

            HechosRendimientoAcademico.objects.bulk_create(hechos_batch)

            if i % 1000 == 0:
                self.stdout.write(f'  → Procesados {i + current_batch_size} registros...')

        self.stdout.write(f'✓ Creados {registros} registros de rendimiento académico')

        # Resumen final
        self.stdout.write('\n' + '='*50)
        self.stdout.write('RESUMEN DE DATOS CREADOS:')
        self.stdout.write('='*50)
        self.stdout.write(f'Programas: {DimPrograma.objects.count()}')
        self.stdout.write(f'Estudiantes: {DimEstudiante.objects.count()}')
        self.stdout.write(f'Materias: {DimMateria.objects.count()}')
        self.stdout.write(f'Docentes: {DimDocente.objects.count()}')
        self.stdout.write(f'Períodos de tiempo: {DimTiempo.objects.count()}')
        self.stdout.write(f'Registros de rendimiento: {HechosRendimientoAcademico.objects.count()}')
        self.stdout.write('='*50)
        self.stdout.write(
            self.style.SUCCESS(f'¡Población completada exitosamente! Total de registros de hechos: {HechosRendimientoAcademico.objects.count()}')
        )
