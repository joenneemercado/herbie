import { tool } from 'ai';
import { z } from 'zod';

import { createPool } from 'mysql2/promise';

// Configuração da conexão MySQL
const pool = createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'seu_banco',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/*
1. Quantos contatos temos na base?
2. Quantas pessoas estão sem comprar nos últimos 7 dias?
3. O que os clientes estão mais comprando?
4. Você consegue identificar algo de semelhante como perfil das pessoas ou produtos que tem coprado entre os clientes que compraram nos últimos 7 dias?
*/
export const mysqlTool = tool({
  description: `
      Realiza uma query no banco de dados para buscar informações sobre orders ou compras realizadas.
      Utilize o cpf como filtro. na tabela de client o documentNumber é o cpf
      
      So pode realizar consultas(SELECT) no banco de dados.
      NÃO é permitido realizar nenhuma operação de escrita(INSERT, UPDATE, DELETE).
               
      Tables:
      """
      # Orders
Field                 |Type            |Null|Key|Default          |Extra         |
----------------------+----------------+----+---+-----------------+--------------+
id                    |int(10) unsigned|NO  |PRI|                 |auto_increment|
OrderRef              |varchar(100)    |NO  |UNI|                 |              |
SequenceRef           |int(10) unsigned|YES |   |                 |              |
OrderDate             |datetime        |YES |MUL|                 |              |
SellerAccountName     |varchar(60)     |YES |   |                 |              |
SellerRef             |int(11)         |YES |   |                 |              |
ClientDocumentType    |varchar(5)      |YES |   |                 |              |
ClientDocumentNumber  |varchar(15)     |NO  |MUL|                 |              |
AddressRef            |varchar(50)     |YES |   |                 |              |
Total                 |float(255,2)    |YES |   |                 |              |
TotalWithoutDiscounts |float(255,2)    |YES |   |                 |              |
ItemsTotal            |float(255,2)    |YES |   |                 |              |
ShippingTotal         |float(255,2)    |YES |   |                 |              |
DiscountsTotal        |float(255,5)    |YES |   |                 |              |
AbsoluteDiscountsTotal|float(255,2)    |YES |   |                 |              |
TaxTotal              |float(255,2)    |YES |   |                 |              |
CouponCode            |varchar(50)     |YES |   |                 |              |
CouponName            |varchar(200)    |YES |   |                 |              |
CouponDescription     |varchar(200)    |YES |   |                 |              |
UtmSource             |varchar(200)    |YES |   |                 |              |
UtmPartner            |varchar(200)    |YES |   |                 |              |
UtmMedium             |varchar(200)    |YES |   |                 |              |
UtmCampaign           |varchar(200)    |YES |   |                 |              |
Status                |varchar(30)     |YES |   |                 |              |
InvoiceNumber         |varchar(40)     |YES |   |                 |              |
InvoiceKey            |varchar(50)     |YES |   |                 |              |
InvoiceIssuanceDate   |datetime        |YES |   |                 |              |
InvoiceUrl            |varchar(500)    |YES |   |                 |              |
InvoiceXml            |text            |YES |   |                 |              |
InvoiceCallbackUrl    |varchar(255)    |YES |   |                 |              |
Courier               |varchar(50)     |YES |   |                 |              |
TrackingNumber        |varchar(40)     |YES |   |                 |              |
TrackingUrl           |varchar(500)    |YES |   |                 |              |
DispatchDate          |datetime        |YES |   |                 |              |
IsIntegrated          |char(1)         |YES |MUL|N                |              |
RegisteredAt          |datetime        |YES |   |CURRENT_TIMESTAMP|              |
DuplicatedFrom        |varchar(100)    |YES |   |                 |              |
FinalizeJson          |json            |YES |   |                 |              |
Cashback              |tinyint(4)      |YES |   |                 |              |
IsIntegratedCashback  |char(1)         |YES |   |N                |              |
---------------------- +----------------+----+---+-----------------+--------------+
# OrderItems
Field        |Type            |Null|Key|Default|Extra         |
-------------+----------------+----+---+-------+--------------+
id           |int(10) unsigned|NO  |PRI|       |auto_increment|
OrderRef     |varchar(100)    |YES |MUL|       |              |
SkuRef       |varchar(255)    |YES |   |       |              |
SkuId        |int(11)         |YES |   |       |              |
SkuName      |varchar(255)    |YES |   |       |              |
Price        |float(255,2)    |YES |   |       |              |
EAN          |varchar(100)    |YES |   |       |              |
Quantity     |int(11)         |YES |   |       |              |
Total        |float(255,2)    |YES |   |       |              |
OriginalId   |int(10) unsigned|YES |   |       |              |
WarehouseRef |varchar(100)    |YES |   |       |              |
WarehouseName|varchar(255)    |YES |   |       |              |

-----------------+----------------+----+---+-------+--------------+
# Client
Field           |Type            |Null|Key|Default|Extra         |
----------------+----------------+----+---+-------+--------------+
id              |int(10) unsigned|NO  |PRI|       |auto_increment|
DocumentType    |varchar(5)      |YES |   |       |              |
DocumentNumber  |varchar(15)     |YES |UNI|       |              |
FirstName       |varchar(1000)   |YES |   |       |              |
LastName        |varchar(100)    |YES |   |       |              |
Phone           |varchar(20)     |YES |   |       |              |
Email           |varchar(255)    |YES |   |       |              |
StateInscription|varchar(45)     |YES |   |       |              |

----------------+----------------+----+---+-------+--------------+


"""
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
    console.log('executando query Mysql');
    console.log({ query, params });
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(query, params);
      connection.release();

      console.log({ result: rows });

      return JSON.stringify(rows, (_, value) =>
        typeof value === 'bigint' ? Number(value) : value,
      );
    } catch (error) {
      console.error('Erro ao executar a query:', error);
      throw new Error('Erro ao consultar o banco de dados');
    }
  },
});
