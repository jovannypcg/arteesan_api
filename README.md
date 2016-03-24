# Arteesan API

## Tecnologías
- Node v4.2
- Mongo v3.0

## Instalación de dependencias

Ejecutar en la raíz del proyecto:

```
npm install
```

## Configuración

Las variables de configuración (nombre de la aplicación, puerto de la aplicación, conexión a Mongo, etc.) se encuentran en el archivo:

```
config/env/system-variables.js
```

Es posible sobrescribir las variables definidas en **system-variables.js** creando un archivo con la siguiente ruta y nombre:

```
config/env/host-system-variables.js
```

Ambos archivos de configuración deben de respetar el mismo formato (estar construido de la misma manera) se puede tener la misma variable en ambos archivos pero el valor que prevalecerá sera el de **host-system-variables.js**.

## Uso

Se crea la carpeta para almacenar logs:

```
mkdir logs
```

En la raíz del proyecto:

```
node server.js
```
o
```
npm start
```

## Docker

Dentro de la carpeta *container/* se encuentran los archivos para la construcción y ejecución del proyecto usando contenedores de Docker.

### Construcción

Se ejecuta el script *build.sh* pasando como parámetro el nombre de la imagen que se va a crear:

```
./build.sh kpulse_api:latest
```

En el ejemplo anterior se usa la etiqueta *latest* para crear la imagen. Se puede usar cualquier identificador válido para el nombre de etiqueta.

### Uso

Para ejecutar el contenedor es necesario indicar el puerto al que se va a mapear el puerto 3000 que expone la imagen:

```
docker run -d -p 3000:3000 kpulse_api:latest
```

En el ejemplo anterior se ocupa el archivo **system-variables.js** de nuestro proyecto local. Es posible indicar la ruta de descarga del archivo de configuración **host-system-variables.js** con la variable de entorno *DOWNLOAD*.

```
docker run -d -p 3000:3000 -e "DOWNLOAD:https://s3-us-west-2.amazonaws.com/kpulse_api/dev/host-system-variables.js" kpulse_api:latest
```
En el ejemplo anterior la variable *DOWNLOAD* se refiere a una ubicación de S3 donde se encuentra el archivo con configuraciones para ambiente de desarrollo.
