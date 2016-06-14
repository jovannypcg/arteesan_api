# Arteesan API

## Tecnologías
- Node v4.2
- Mongo v3.0

## Instalación de dependencias

Ejecutar en la raíz del proyecto:

```
npm install
```


## Uso

En la raíz del proyecto:

```
node server.js
```
o
```
npm start
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