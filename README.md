# Herbie - Customer Data Platform (CDP)

Herbie é uma plataforma backend desenvolvida em Node.js/NestJS para centralizar, unificar, enriquecer e ativar dados de clientes (Customer Data Platform - CDP). O sistema é modular, escalável e pronto para integrações com múltiplos canais e sistemas externos.

## Principais Tecnologias

- **Node.js** + **NestJS**: Framework backend modular e escalável.
- **TypeScript**: Tipagem estática para maior robustez.
- **Prisma ORM**: Mapeamento objeto-relacional para bancos SQL.
- **JWT (JSON Web Token)**: Autenticação e autorização segura.
- **Passport**: Estratégias de autenticação (local, JWT).
- **Bcrypt**: Hash de senhas.
- **Docker**: Containerização e orquestração de ambiente.
- **Swagger**: Documentação automática da API.
- **Cache (ex: Redis)**: Armazenamento temporário de tokens e dados.

## Estrutura de Pastas

```
src/
  auth/         # Autenticação e autorização
  brands/       # Marcas
  campaigns/    # Campanhas e audiências
  categories/   # Categorias de produtos
  channels/     # Canais de comunicação
  connectors/   # Integrações externas (AI, Vtex, Invio, etc)
  customers/    # Clientes, endereços, campos customizados
  database/     # Módulo de acesso ao banco (Prisma)
  events/       # Eventos do sistema
  orders/       # Pedidos e itens
  products/     # Produtos e SKUs
  queue/        # Processamento assíncrono
  seller/       # Vendedores
  tags/         # Tags e segmentação
  users/        # Usuários do sistema
  ...           # Outros módulos
```

## Setup do Projeto

### Pré-requisitos
- Node.js >= 18.x
- Docker e Docker Compose (recomendado para banco e cache)
- Yarn ou npm

### Instalação

1. **Clone o repositório:**
   ```bash
   git clone <repo-url>
   cd herbie
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configure as variáveis de ambiente:**
   - Copie `.env.example` para `.env` e ajuste conforme necessário (banco, JWT, etc).

4. **Suba os serviços de infraestrutura (opcional):**
   ```bash
   docker-compose up -d
   ```

5. **Rode as migrations do banco:**
   ```bash
   npx prisma migrate deploy
   # ou para desenvolvimento
   npx prisma migrate dev
   ```

6. **Inicie o servidor:**
   ```bash
   npm run start:dev
   # ou
   yarn start:dev
   ```

7. **Acesse a documentação da API:**
   - Swagger: [http://localhost:3000/api](http://localhost:3000/api)

## Comandos Úteis

- `start:dev` - Inicia o servidor em modo desenvolvimento
- `start` - Inicia em produção
- `test` - Executa os testes automatizados
- `lint` - Checa o padrão de código
- `prisma studio` - Interface visual para o banco de dados

## Funcionalidades Principais
- Cadastro e gestão de clientes, endereços e campos customizados
- Gestão de produtos, categorias, marcas e SKUs
- Processamento de pedidos e itens
- Segmentação e campanhas
- Integração com múltiplos canais e sistemas externos
- Autenticação JWT, roles e escopos
- Processamento assíncrono via filas

## Contribuição
1. Crie um fork do projeto
2. Crie uma branch para sua feature/fix
3. Faça commit das suas alterações
4. Envie um Pull Request

## Sobre CDP (Customer Data Platform)

Uma CDP é uma plataforma projetada para coletar, unificar, gerenciar e enriquecer dados dos clientes de uma empresa. O Herbie implementa:
- Coleta e unificação de dados de clientes, endereços e campos personalizados
- Análise de comportamento de compra (pedidos, produtos, categorias)
- Ativação de dados para campanhas e recomendações
- Registro de interações e integrações com sistemas externos
- Suporte a segmentação, histórico e compliance (LGPD/GDPR)

---

Para dúvidas ou sugestões, abra uma issue ou entre em contato com os mantenedores.
