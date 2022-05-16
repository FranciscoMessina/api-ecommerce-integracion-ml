# API de manejo de comercio con integración a Mercado Libre.

A este proyecto lo acompaña una aplicación de [React](https://github.com/FranciscoMessina/dashboard-ecommerce-ml)

Es un proyecto en el cual estoy trabajando con el objetivo de resolver algunos inconvenientes con los cuales nos encontramos en mi trabajo actual (un comercio de productos usados, con venta online por mercado libre), el principal problema con el que nos encontramos es el manejo del stock, ya que no tenemos ningún sistema para hacerlo, y al vender productos usados muchos de ellos solo tenemos disponibles 1 unidad de cada uno. Para eso estoy tratando de armar un sistema de manejo de stock muy personalizado que se adapte a nuestras necesidades, una de las funciones más importante es que se actualice automáticamente el stock con mercado libre.

Algunas ideas que fui desarrollando, y planeo desarrollar más adelante fueron inspiradas de plataformas como [Real Trends](https://www.real-trends.com/ar/), pero modificadas para adaptarse específicamente a nuestros requerimientos.

## Funcionalidades

- Interfaz para responder preguntas con más facilidad:
  - Respuestas rápidas personalizables, se puede insertar arrastrándolas al input o con escribiendo un "@", que despliega una interfaz para elegir cual insertar.
  - Insertar links a otras publicaciones de Mercado Libre escribiendo "#" seguido de parte del título de la publicación que se desea insertar (si tiene espacios escribir "\_").
  - Saludo y despedida insertados adelante y detrás de la respuesta.
  - Información más detallada de la publicación sobre la cual nos están preguntando (Condición de la publicación "Nuevo" o "Usado" varias veces tenemos productos iguales en diferentes condiciones, y esto nos hace más sencillo saber cual tenemos que tomar como referencia para responder).
  - La opción de pausar y reactivar la publicación directamente desde la pregunta.
  - La opción de eliminar la pregunta.
  - Actualización de las preguntas en tiempo real mediante los Webhooks de la API de mercado libre.
  - Historial de preguntas respondidas en general, y al mismo comprador en la misma publicación.
- Envío de mensaje automático a compras con entrega a acordar al vendedor: se puede modificar eligiendo insertar en el mensaje, el nombre y/o usuario del comprador, o el titulo de la publicación comprada.
- Autenticación con access y refresh tokens, ademas de protocolo OAuth para la autenticación con la API de Mercado Libre.

## Funcionalidades en progreso

- Manejo de ventas con seguimiento del "estado de búsqueda" (Pendiente, No encontrado, Econtrado) y envío de mensajes al comprador dependiendo de si el producto ya fue encontrado y separado o no. (Nos pasa de vender producto que no tenemos, entonces esto seria para avisarle al comprador una vez que ya confirmamos que el producto está disponible, ademas de para poder tener un seguimiento de los productos que encontramos y los que no, y tratar de evitar que pase en el futuro)
- Filtrar las ventas por el estado de búsqueda en que se encuentran.
- Insertar link de búsqueda en nuestras publicaciones (El cliente pide un tipo de producto X, poder insertar el link a nuestras publicaciones en MercadoLibre con la búsqueda solicitada por el cliente fácilmente, por ejemplo escribiendo &"búsqueda X" y que automáticamente se inserte en la respuesta "linkapublicacionesdeXvendedor/search=búsqueda X")
- Un sistema de push notification para siempre estar al tanto de las actualizaciones.

## Funcionalidades planeadas

- Integración de todo el catalogo disponible para hacer más fácil el manejo del stock, y integración del mismo a la venta presencial y online, para que siempre se mantenga actualizado y no se vendan productos no disponibles.
- Integración a un sistema de facturación para automaticamente hacer las facturas correpondientes cuando se genera una venta.
- Agregado de productos simultaneamente al catalogo interno y a Mercado Libre.
- Todas las funcionalidades de un E-commerce para tener una plataforma propia de venta online.
- Y muchas cosas más que irán surgiendo con el tiempo.

## Tecnologías utilizadas

- NestJS
- Passport
- TypeORM
- Docker Compose
- PostgreSQL
- Redis
- Typescript
