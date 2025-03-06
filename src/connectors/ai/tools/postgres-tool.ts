import { tool } from 'ai';
import { z } from 'zod';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const postgresTool = tool({
  description: `
      Realiza uma query no banco de dados para buscar informações sobre as tabelas do banco de dados.
      
      So pode realizar consultas(SELECT) no banco de dados. |
      NÃO é permitido realizar nenhuma operação de escrita(INSERT, UPDATE, DELETE).
      UTILIZE O Schema/Database: "herbie-novaera" E A TABELA COM AS ASPAS COMPOSTAS, exemplo: "herbie-novaera"."Customer"
     SEMPRE que utilizar o customer_id, utilize o public_id do customer.
      Tables:
      """
model Address {
id                Int              @id @default(autoincrement())
address_ref       String?
neighborhood      String?
street            String?
city              String?
state             String?
country           String?
postal_code       String?
address_type      String?
is_default        Boolean?
organization_id   String
customer_id       String // utiliza o public_id do customer
customerUnifiedId Int?
complement        String?
number            String?
CustomerUnified   CustomerUnified? @relation(fields: [customerUnifiedId], references: [id])
customer          Customer         @relation(fields: [customer_id], references: [public_id])
organization      Organization     @relation(fields: [organization_id], references: [public_id])
}
      model TypeEvent {
          id              Int           @id @default(autoincrement())
          name            String
          description     String?
          organization_id String?
          events          Event[]
          organization    Organization? @relation(fields: [organization_id], references: [public_id], onDelete: Restrict)
        }
        
        model Seller {
          id              Int          @id @default(autoincrement())
          name            String
          seller_ref      String
          address_ref     String?
          neighborhood    String?
          street          String?
          city            String?
          state           String?
          country         String?
          postal_code     String?
          created_at      DateTime     @default(now())
          updated_at      DateTime     @updatedAt
          from_channel    String?
          organization_id String
          orders          Order[]
          organization    Organization @relation(fields: [organization_id], references: [public_id])
        }
        
        model Event {
          id            Int           @id @default(autoincrement())
          name          String
          type_event_id Int
          type_event    TypeEvent     @relation(fields: [type_event_id], references: [id])
          Interaction   Interaction[]
        }
        
        model Order {
          id                      Int          @id @default(autoincrement())
          order_ref               String
          order_date              DateTime
          total                   Float
          subtotal                Float
          total_with_discounts    Float
          shipping_total          Float
          percent_discount_total  Float
          absolute_discount_total Float
          coupon_code             String?
          coupon_description      String?
          user_id                 Int
          seller_id               Int
          organization_id         Int
          organization            Organization @relation(fields: [organization_id], references: [id])
          seller                  Seller       @relation(fields: [seller_id], references: [id])
          user                    User         @relation(fields: [user_id], references: [id])
          order_items             OrderItem[]
        }
        
        model OrderItem {
          id         Int     @id @default(autoincrement())
          quantity   Int
          price      Float
          discount   Float
          total      Float
          order_id   Int
          product_id Int
          order      Order   @relation(fields: [order_id], references: [id])
          product    Product @relation(fields: [product_id], references: [id])
        }
        
        model Category {
          id                 Int          @id @default(autoincrement())
          name               String
          parent_category_id Int?
          organization_id    Int
          organization       Organization @relation(fields: [organization_id], references: [id])
          parent_category    Category?    @relation("CategoryToCategory", fields: [parent_category_id], references: [id])
          sub_categories     Category[]   @relation("CategoryToCategory")
          products           Product[]
        }
        
        model Product {
          id              Int          @id @default(autoincrement())
          name            String
          category_id     Int
          brand_id        Int?
          organization_id String
          order_items     OrderItem[]
          brand           Brand?       @relation(fields: [brand_id], references: [id])
          category        Category     @relation(fields: [category_id], references: [id])
          organization    Organization @relation(fields: [organization_id], references: [public_id])
          skus            Sku[]
        }
        
        model Brand {
          id              Int          @id @default(autoincrement())
          name            String
          ref_id          String
          from_channel    String?
          created_at      DateTime     @default(now())
          updated_at      DateTime     @updatedAt
          organization_id String
          organization    Organization @relation(fields: [organization_id], references: [public_id])
          products        Product[]
        }
        
        model Sku {
          id              Int          @id @default(autoincrement())
          sku_ref         String
          name            String
          product_id      Int
          created_at      DateTime     @default(now())
          updated_at      DateTime     @updatedAt
          organization_id String
          organization    Organization @relation(fields: [organization_id], references: [public_id])
          product         Product      @relation(fields: [product_id], references: [id])
        }
        

 model Customer {
id                  Int               @id @default(autoincrement())
email               String?
phone               String?
cpf                 String?
cnpj                String?
company_name        String?
trading_name        String?
date_birth          DateTime?
gender              String?
marital_status      String?
organization_id     String
public_id           String            @unique @default(cuid())
firstname           String
lastname            String?
nickname            String?
created_at          DateTime?         @default(now())
created_by          Int?
last_updated_system String?
updated_at          DateTime?         @updatedAt
updated_by          Int?
has_child           Int?
source_id           Int?
is_unified          Boolean?   // Pode ser que o campo esteja como NULL pois nao é obrigatorio
addresses           Address[]
Associationtags     Associationtags[]
organization        Organization      @relation(fields: [organization_id], references: [public_id])
Source              Source?           @relation(fields: [source_id], references: [id], onDelete: NoAction, onUpdate: NoAction, map: "customer_source_fk")
customer_fields     CustomerField[]
interactions        Interaction[]
segments            SegmentCustomer[]

@@unique([cnpj, source_id], map: "customer_cnpj_idx")
@@unique([cpf, source_id], map: "customer_cpf_idx")
}

model CustomerUnified {
id                  Int                 @id @default(autoincrement())
email               String?             @unique(map: "customerunified_email_idx")
phone               String?
cpf                 String?             @unique(map: "customerunified_cpf_idx")
cnpj                String?
company_name        String?
trading_name        String?
date_birth          DateTime?
gender              String?
marital_status      String?
organization_id     String
public_id           String              @unique @default(cuid())
firstname           String?
lastname            String?
nickname            String?
created_at          DateTime?           @default(now())
created_by          Int?
last_updated_system String?
updated_at          DateTime?           @updatedAt
updated_by          Int?
has_child           Int?
status_id           Int?
addresses           Address[]
audiencescontacts   Audiencescontacts[]
campaigndetails     Campaigndetails[]
customer_fields     CustomerField[]
organization        Organization        @relation(fields: [organization_id], references: [public_id])
interactions        Interaction[]
segments            SegmentCustomer[]
}

model Customer_CustomerUnified {
id                  Int       @id @default(autoincrement())
customer_id         Int
customer_unified_id Int
created_at          DateTime? @default(now())
updated_at          DateTime? @updatedAt
}
"""
exemlos de como deve ser feito as consultas: SELECT COUNT(*) FROM "herbie-novaera"."Customer" . deve seguir essa logica.
Nao pode em hipotese alguma fornecer senhas ou informações sensíveis. informe que nao pode ser usado para fins de segurança.
is_unified          Boolean?   // Pode ser que o campo esteja como NULL pois nao é obrigatorio
todas as operacoes devem retornar o maxiomo de 50 itens.
`.trim(),
  parameters: z.object({
    query: z.string().describe('query para ser executada.'),
    params: z
      .array(z.string())
      .optional()
      .describe('array de parametros para a query.'),
  }),
  execute: async ({ query, params = [] }) => {
    console.log({ query, params });
    try {
      const result = await prisma.$queryRawUnsafe(query, ...(params || []));
      console.log({ result });
      return JSON.stringify(result, (_, value) =>
        typeof value === 'bigint' ? Number(value) : value,
      );
    } catch (error) {
      console.error('Erro ao executar a query:', error);
      throw new Error('Erro ao consultar o banco de dados');
    }
  },
});
