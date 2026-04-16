const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Restaurant Management API',
      version: '1.0.0',
      description: 'API documentation for Restaurant Management System',
      contact: {
        name: 'Development Team',
        email: 'dev@restaurant.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Development server'
      },
      {
        url: 'https://api.restaurant.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'restaurant_session',
          description: 'Session cookie for authentication'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            error: {
              type: 'string',
              example: 'Detailed error information'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            username: {
              type: 'string',
              example: 'user123'
            },
            email: {
              type: 'string',
              example: 'user@example.com'
            },
            role: {
              type: 'string',
              enum: ['customer', 'employee', 'admin'],
              example: 'customer'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        MenuItem: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            name: {
              type: 'string',
              example: 'Phở Bò'
            },
            description: {
              type: 'string',
              example: 'Phở bò truyền thống Hà Nội'
            },
            price: {
              type: 'number',
              example: 85000
            },
            sale_price: {
              type: 'number',
              nullable: true,
              example: 75000
            },
            images: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['/images/pho-bo.jpg']
            },
            category_id: {
              type: 'integer',
              example: 1
            },
            available: {
              type: 'boolean',
              example: true
            }
          }
        },
        Cart: {
          type: 'object',
          properties: {
            cart_id: {
              type: 'integer',
              example: 1
            },
            user_id: {
              type: 'integer',
              nullable: true,
              example: 5
            },
            session_id: {
              type: 'string',
              nullable: true,
              example: 'sess_abc123'
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'CHECKED_OUT', 'ABANDONED'],
              example: 'ACTIVE'
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'integer',
                    example: 1
                  },
                  menu_item_id: {
                    type: 'integer',
                    example: 10
                  },
                  quantity: {
                    type: 'integer',
                    example: 2
                  },
                  note: {
                    type: 'string',
                    example: 'Không hành'
                  },
                  name: {
                    type: 'string',
                    example: 'Phở Bò'
                  },
                  price: {
                    type: 'number',
                    example: 85000
                  },
                  sale_price: {
                    type: 'number',
                    nullable: true,
                    example: null
                  },
                  images: {
                    type: 'array',
                    items: {
                      type: 'string'
                    }
                  },
                  available: {
                    type: 'boolean',
                    example: true
                  }
                }
              }
            },
            item_count: {
              type: 'string',
              example: '2'
            },
            total_quantity: {
              type: 'string',
              example: '5'
            },
            total_amount: {
              type: 'string',
              example: '425000.00'
            }
          }
        },
        RestaurantInfo: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            name: {
              type: 'string',
              example: 'Nha Hang ABC'
            },
            slogan: {
              type: 'string',
              nullable: true,
              example: 'Huong vi Viet trong tung mon an'
            },
            logo_url: {
              type: 'string',
              nullable: true,
              example: 'https://example.com/logo.png'
            },
            brand_image_url: {
              type: 'string',
              nullable: true,
              example: 'https://example.com/banner.png'
            },
            address_line: {
              type: 'string',
              example: '123 Le Loi, Quan 1, TP.HCM'
            },
            contact_phone: {
              type: 'string',
              nullable: true,
              example: '0909123456'
            },
            contact_email: {
              type: 'string',
              nullable: true,
              example: 'contact@restaurant.com'
            },
            opening_time: {
              type: 'string',
              example: '08:00:00'
            },
            closing_time: {
              type: 'string',
              example: '22:00:00'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Review: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 101
            },
            user_id: {
              type: 'integer',
              example: 5
            },
            menu_item_id: {
              type: 'integer',
              example: 12
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              example: 4
            },
            comment: {
              type: 'string',
              example: 'Phan an ngon, phuc vu nhanh'
            },
            is_hidden: {
              type: 'boolean',
              example: false
            },
            hidden_reason: {
              type: 'string',
              nullable: true,
              example: null
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        ReviewReport: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 501
            },
            review_id: {
              type: 'integer',
              example: 101
            },
            reporter_id: {
              type: 'integer',
              example: 8
            },
            reason: {
              type: 'string',
              enum: ['spam', 'offensive', 'harassment', 'fake', 'irrelevant'],
              example: 'offensive'
            },
            note: {
              type: 'string',
              nullable: true,
              example: 'Noi dung xuc pham'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'Authentication and authorization endpoints'
      },
      {
        name: 'Menu',
        description: 'Menu management endpoints'
      },
      {
        name: 'Cart',
        description: 'Shopping cart endpoints'
      },
      {
        name: 'Orders',
        description: 'Order management endpoints'
      },
      {
        name: 'Restaurant',
        description: 'Restaurant profile endpoints'
      },
      {
        name: 'Reviews',
        description: 'Review endpoints for customers'
      },
      {
        name: 'Admin Reviews',
        description: 'Review moderation endpoints for admin'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
