# API de manejo de comercio con integración a Mercado Libre.

A este proyecto lo acompaña una aplicación de [React](https://github.com/FranciscoMessina/dashboard-libreria)

Es un proyecto en el cual estoy trabajando con el objetivo de resolver algunos inconvenientes con los cuales nos encontramos en mi trabajo actual (un comercio de productos usados, con venta online por mercado libre), el principal problema con el que nos encontramos es el manejo del stock, ya que no tenemos ningún sistema para hacerlo, y al vender productos usados muchos de ellos solo tenemos disponibles 1 unidad de cada uno. Para eso estoy tratando de armar un sistema de manejo de stock muy personalizado que se adapte a nuestras necesidades, una de las funciones más importante es que se actualice automáticamente el stock con mercado libre.

Algunas ideas que fui desarrollando, y planeo desarrollar más adelante fueron inspiradas de plataformas como [Real Trends](https://www.real-trends.com/ar/), pero modificadas para adaptarse específicamente a nuestros requerimientos.

## Funcionalidades

- Interfaz para responder preguntas con mas facilidad:
  - Respuestas rápidas personalizables, se puede insertar arrastrándolas al input o con escribiendo un "@", que despliega una interfaz para elegir cual insertar.
  - Insertar links a otras publicaciones de Mercado Libre escribiendo "#" seguido de parte del título de la publicación que se desea insertar (si tiene espacios escribir "\_").
  - Saludo y despedida insertados adelante y detrás de la respuesta.
  - Información más detallada de la publicación sobre la cual nos están preguntando.
  - La opción de pausar y reactivar la publicación directamente desde la pregunta.
  - La opción de eliminar la pregunta.
  - Actualización de las preguntas en tiempo real mediante los Webhooks de la API de mercado libre.
- Envío de mensaje automático a compras con entrega a acordar al vendedor: se puede modificar eligiendo insertar en el mensaje, el nombre y/o usuario del comprador, o el titulo de la publicación comprada.
- Autenticación con access y refresh tokens, ademas de protocolo OAuth para la autenticación con la API de Mercado Libre.
- 
