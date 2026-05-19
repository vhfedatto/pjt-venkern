# Venkern Style Guide

## 1. Introdução

O **Venkern** é uma plataforma SaaS acadêmica criada para apoiar a gestão de equipes, contatos, tarefas e fluxos de trabalho dentro de uma fábrica de software.

Este documento funciona como um **Style Guide / Design System inicial** para o front-end. O objetivo é ajudar a equipe a manter uma interface consistente, previsível e profissional, mesmo com várias pessoas trabalhando no produto ao mesmo tempo.

Quando todo mundo segue os mesmos padrões de design:

- a interface fica mais organizada
- a experiência do usuário melhora
- o código visual fica mais fácil de manter
- novas telas podem ser criadas mais rápido

## 2. Identidade Visual

A identidade visual do Venkern deve transmitir uma sensação de produto:

- moderno
- clean
- SaaS
- profissional
- tecnológico
- minimalista

O sistema deve comunicar principalmente:

- **organização**: o usuário precisa sentir que tudo está em seu devido lugar
- **clareza**: a informação deve ser fácil de entender rapidamente
- **produtividade**: a interface deve ajudar a tomar decisões e agir
- **conexão entre equipes**: o produto existe para integrar pessoas, áreas e entregas

### Direção visual geral

A linguagem visual deve seguir o padrão de dashboards modernos:

- fundo claro
- superfícies brancas
- contraste limpo
- cor primária aplicada com moderação
- sombra leve
- cantos arredondados
- tipografia legível

O roxo do Venkern funciona como cor de identidade, mas não deve dominar tudo. O ideal é usar o roxo para:

- botões principais
- destaques estratégicos
- elementos ativos
- estados importantes da navegação

## 3. Tipografia

### Fonte principal

- **Andika**

A Andika deve ser usada como fonte base da interface porque ela oferece uma leitura muito amigavel, com formas claras e um tom mais humano, sem perder a organizacao necessaria para dashboards, tabelas, formularios e textos pequenos.

### Fonte secundária

- **Poppins**

A Poppins deve ser usada principalmente em:

- títulos principais
- destaques visuais
- nomes de seções
- branding

### Pesos recomendados

- `700` para títulos
- `500` para subtítulos
- `400` para textos corridos

### Onde usar cada uma

#### Andika

Use Andika em:

- textos de cards
- labels
- inputs
- tabelas
- textos de apoio
- menus
- pequenas descrições

#### Poppins

Use Poppins em:

- H1
- H2
- títulos de painéis
- branding do produto

### Exemplos de escala tipográfica

#### H1

- fonte: `Poppins`
- peso: `700`
- tamanho sugerido: `40px a 48px`
- uso: título principal da página

#### H2

- fonte: `Poppins`
- peso: `700`
- tamanho sugerido: `24px a 32px`
- uso: títulos de seções e painéis

#### Body

- fonte: `Inter`
- peso: `400`
- tamanho sugerido: `16px`
- uso: textos principais da aplicação

#### Small text

- fonte: `Inter`
- peso: `400`
- tamanho sugerido: `12px a 14px`
- uso: textos de apoio, legendas, observações e labels secundários

## 4. Ícones

### Biblioteca oficial

O projeto deve usar oficialmente:

- **Phosphor Icons**

### Por que essa biblioteca foi escolhida?

A Phosphor foi escolhida porque ela oferece:

- estilo minimalista
- boa consistência visual
- variedade suficiente para dashboards
- excelente leitura em tamanhos pequenos
- licença open source amigável

Ela combina bem com a identidade do Venkern porque não pesa visualmente e funciona muito bem em produtos SaaS.

### Instalação

```bash
npm install @phosphor-icons/react
```

### Licença e uso

A biblioteca é open source e pode ser usada em projetos comerciais.

### Regras de uso

- usar preferencialmente o peso **regular**
- usar **duotone** apenas para destaques específicos
- evitar misturar bibliotecas diferentes de ícones no mesmo produto
- manter tamanho e alinhamento consistentes

### Ícones recomendados por contexto

- Dashboard: `SquaresFour`
- Contacts: `Users`
- Teams: `UsersThree`
- Tasks: `Checks`
- Kanban: `Kanban`
- Settings: `Gear`
- Notifications: `Bell`
- Search: `MagnifyingGlass`
- Favorite: `Star`
- Delete: `Trash`
- Edit: `PencilSimple`

## 5. Paleta de Cores

### Primary

- `#6C63FF`

Cor principal da marca. Use em:

- botões primários
- links principais
- itens ativos
- destaques visuais moderados

### Primary Dark

- `#5146E5`

Use em:

- hover do botão principal
- textos destacados sobre fundos claros
- reforço visual de elementos ativos

### Sidebar Background

- `#1E1B2E`

Use como fundo da sidebar e de áreas de navegação escuras.

### Background

- `#F5F7FB`

Fundo geral da aplicação.

### Card Background

- `#FFFFFF`

Fundo de cards, modais, painéis e superfícies internas.

### Border

- `#E5E7EB`

Use em:

- bordas de cards
- separadores
- inputs
- tabelas

### Text Primary

- `#111827`

Cor principal para títulos e textos de alta prioridade.

### Text Secondary

- `#6B7280`

Use em:

- subtítulos
- textos auxiliares
- descrições
- labels secundários

### Success

- `#22C55E`

Use em:

- estados positivos
- confirmações
- badges de sucesso
- tarefas concluídas

### Warning

- `#F59E0B`

Use em:

- alertas moderados
- itens em revisão
- estados que precisam de atenção

### Danger

- `#EF4444`

Use em:

- exclusão
- erros
- estados críticos
- tasks atrasadas, se fizer sentido visualmente

### Info

- `#3B82F6`

Use em:

- informações auxiliares
- estados de progresso
- destaques informativos

### Boas práticas com cor

- evitar excesso de roxo em todas as superfícies
- usar branco como base para respirabilidade
- garantir contraste suficiente entre texto e fundo
- não depender apenas da cor para comunicar estado

## 6. Layout

### Estrutura recomendada

O layout principal do Venkern deve seguir:

- sidebar fixa
- header superior
- área principal com cards e seções
- espaçamento confortável
- leitura clara das informações

### Princípios do layout

- dashboard clean
- hierarquia visual clara
- agrupamento lógico de informações
- blocos visuais com respiro

### Tokens recomendados

- `border-radius: 16px`
- sombras leves
- padding consistente

### Padrões de espaçamento

Use espaços regulares para dar previsibilidade visual. Como referência:

- `8px` para espaços muito pequenos
- `12px` para elementos próximos
- `16px` para espaçamento interno padrão
- `24px` para separação entre grupos
- `32px` para separação entre grandes seções

## 7. Componentes

### Buttons

#### Botão primário

Use para a ação mais importante da tela.

Características:

- fundo roxo
- texto branco
- raio de `16px`
- sombra leve

Estados:

- hover: escurecer levemente
- active: reduzir sombra
- focus: borda de foco visível
- disabled: opacidade reduzida e cursor bloqueado

#### Botão secundário

Use para ações de apoio.

Características:

- fundo branco
- borda sutil
- texto escuro

### Inputs

Padrão recomendado:

- fundo branco
- borda `#E5E7EB`
- cantos arredondados
- placeholder discreto
- foco com destaque suave em roxo

### Cards

Os cards são a base da interface do dashboard.

Padrão:

- fundo branco
- borda suave
- sombra leve
- padding confortável
- conteúdo organizado verticalmente

### Modals

Padrão sugerido:

- fundo branco
- radius entre `16px` e `20px`
- sombra mais forte que cards
- overlay escuro com transparência
- ações alinhadas no rodapé

### Sidebar Items

Padrão:

- área clicável grande
- texto alinhado à esquerda
- estado ativo com fundo levemente destacado
- hover sutil

### Tables

Padrão:

- cabeçalho destacado
- linhas com bom respiro vertical
- bordas suaves
- zebra opcional apenas se necessário
- alinhar números e datas com consistência

### Kanban Cards

Padrão:

- compactos
- legíveis
- com título forte
- descrição curta
- tag ou status de apoio
- sombra leve
- canto arredondado

### Estados de UI

Todos os componentes interativos devem ter:

- `hover`
- `active`
- `focus`
- `disabled`

Nunca depender só do `hover`. O estado de foco é obrigatório para acessibilidade básica.

## 8. Responsividade

A estratégia atual recomendada é:

- **desktop first**
- suporte básico para tablet e mobile

### Regras gerais

- reduzir grids de várias colunas para 2 ou 1 coluna em telas menores
- permitir scroll horizontal em áreas complexas, como kanban, quando necessário
- manter legibilidade dos cards em telas estreitas

### Futuro

A sidebar poderá ser:

- colapsável
- convertida em drawer no mobile

## 9. Estrutura CSS

### Recomendação oficial

A equipe pode usar:

- **CSS Modules**
- ou **CSS puro organizado por componente**

### Evitar

- inline styles em excesso
- estilos duplicados
- arquivos gigantes sem separação lógica
- valores de cor e espaçamento repetidos sem uso de variáveis

### Recomendação prática

- usar `theme.css` para tokens globais
- usar estilos locais por componente ou por página
- manter nomes claros e previsíveis

## 10. Convenções Front-end

### Nomenclatura

- nomes em inglês
- componentes em `PascalCase`
- funções em `camelCase`
- constantes em nomes claros e descritivos

### Organização sugerida

- `components/` para componentes reutilizáveis
- `pages/` para páginas completas, quando existirem
- `data/` para mocks temporários
- `styles/` para arquivos globais, tokens e utilidades

### Exemplos

- `SummaryCard.jsx`
- `ContactCard.jsx`
- `TaskColumn.jsx`
- `mockData.js`
- `theme.css`

## 11. Futuro do Design System

Este Design System é um ponto de partida. Com a evolução do produto, ele pode crescer para algo mais robusto.

Próximas possibilidades:

- migrar para uma arquitetura de componentes ainda mais reutilizável
- documentar componentes com exemplos visuais
- criar tokens semânticos mais avançados
- padronizar estados de formulário e feedback
- montar uma biblioteca própria de componentes do Venkern

### Sobre Tailwind

No futuro, o time pode avaliar uma migração parcial ou total para Tailwind se isso fizer sentido para produtividade. Mas neste momento, a prioridade é manter o projeto claro e simples para a equipe acadêmica.

### Evolução do SaaS

Conforme o Venkern amadurecer, o design system também deve evoluir para suportar:

- autenticação
- múltiplos perfis de usuário
- mais módulos internos
- dashboards mais complexos
- experiências de produto mais completas

## 12. Resumo prático

Se houver dúvida durante o desenvolvimento front-end, siga esta ordem:

1. usar as variáveis do `theme.css`
2. preferir Inter e Poppins nos contextos definidos
3. usar Phosphor Icons
4. manter bordas arredondadas e sombras leves
5. evitar excesso de cores fortes
6. priorizar clareza e consistência antes de inventar novos padrões

Esse documento deve ser atualizado conforme o produto crescer. Hoje ele já serve como base sólida para manter a identidade visual do Venkern alinhada entre todos os membros da equipe.

