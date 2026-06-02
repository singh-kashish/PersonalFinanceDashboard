import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',

    info: {
      title: 'Personal Finance API',
      version: '1.0.0',
      description: 'Personal finance dashboard backend API',
    },

    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],

    components: {
  ssecuritySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },

  schemas: {
    SignupInput: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          example: 'test@gmail.com',
        },
        name: {
          type: 'string',
          example: 'Kash',
        },
        password: {
          type: 'string',
          example: 'password123',
        },
      },
    },

    LoginInput: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          example: 'test@gmail.com',
        },
        password: {
          type: 'string',
          example: 'password123',
        },
      },
    },
  },
}
  },

  apis:['./src/routes/*.ts']
};

const swaggerSpec =
swaggerJsdoc(options);

export default swaggerSpec;