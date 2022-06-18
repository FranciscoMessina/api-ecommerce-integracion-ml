interface ICreateItem {
  title: string;
  price: number;
  currency_id: string;
  stock: number;
  condition: string;
  pictures: string[];
  channels: string[];
  accesories: string;
  authors: string[];
  publisher: string;
  cover: string;
  genre: string;
  bookTitle: string;
  isbn: number;
  height: number;
  pocket: boolean;
  language: string;
  weight: number;
  width: number;
  depth: number;
  coloring: boolean;
  sku: string;
  pageCount: number;
  publishedDate: string;
  narrationType: string;
  maxAge: number;
  minAge: number;
}

export const createItemTemplate = (data: ICreateItem) => ({
  site_id: 'MLA',
  title: data.title,
  category_id: 'MLA412445',
  price: data.price,
  currency_id: 'ARS',
  available_quantity: data.stock,
  sale_terms: [
    {
      id: 'WARRANTY_TIME',
      value_name: '1 meses',
    },
    {
      id: 'WARRANTY_TYPE',
      value_name: 'Garantía del vendedor',
    },
  ],
  buying_mode: 'buy_it_now',
  listing_type_id: 'gold_special',
  condition: data.condition,
  pictures: [
    {
      source: 'http://mla-s2-p.mlstatic.com/968521-MLA20805195516_072016-O.jpg',
    },
  ],
  shipping: {
    free_shipping: false,
  },
  attributes: [
    {
      id: 'ACCESSORIES_INCLUDED',
      value_name: data.accesories || 'NO',
    },
    {
      id: 'AUTHOR',
      value_name: data.authors.reduce((acc, author) => `${acc}, ${author}`),
    },
    {
      id: 'BOOK_COLLECTION',
      value_name: data.publisher,
    },
    {
      id: 'BOOK_COVER',
      value_name: data.cover,
    },
    {
      id: 'BOOK_GENRE',
      value_name: data.genre,
    },
    {
      id: 'BOOK_PUBLISHER',
      value_name: data.publisher,
    },
    {
      id: 'BOOK_SUBGENRES',
      value_name: data.genre,
    },
    {
      id: 'BOOK_TITLE',
      value_name: data.bookTitle,
    },
    {
      id: 'CO_AUTHORS',
      value_name: 'No',
    },
    {
      id: 'FORMAT',
      value_id: '2132698',
      value_name: 'Papel',
    },
    {
      id: 'GTIN',
      name: 'ISBN',
      value_name: data.isbn || null,
    },
    {
      id: 'HEIGHT',
      name: 'Altura',
      value_name: data.height || '1 cm',
    },
    {
      id: 'IS_POCKET_FORMAT',
      // value_id: "242084",
      value_name: data.pocket ? 'Si' : 'No',
    },
    {
      id: 'ITEM_CONDITION',
      name: 'Condición del ítem',
      // value_id: "2230284",
      value_name: data.condition === 'new' ? 'Nuevo' : 'Usado',
    },
    {
      id: 'LANGUAGE',
      name: 'Idioma',
      value_name: data.language,
    },
    {
      id: 'MAX_RECOMMENDED_AGE',
      name: 'Edad máxima recomendada',
      value_name: data.maxAge || '100 años',
    },
    {
      id: 'MIN_RECOMMENDED_AGE',
      name: 'Edad mínima recomendada',
      value_name: data.minAge || '1 años',
    },
    {
      id: 'NARRATION_TYPE',
      name: 'Tipo de narración',
      value_name: data.narrationType || 'Novela',
    },
    {
      id: 'PAGES_NUMBER',
      name: 'Cantidad de páginas',
      value_name: data.pageCount || '1',
    },
    {
      id: 'PUBLICATION_YEAR',
      name: 'Año de publicación',
      value_name: data.publishedDate || '1',
    },
    {
      id: 'SELLER_SKU',
      name: 'SKU',
      value_name: data.sku || null,
    },
    {
      id: 'TRANSLATORS',
      name: 'Traductores',
      value_id: null,
      value_name: 'No',
    },
    {
      id: 'WEIGHT',
      name: 'Peso',
      value_id: null,
      value_name: '1 g',
    },
    {
      id: 'WIDTH',
      name: 'Ancho',
      value_name: data.width || '1 cm',
    },
    {
      id: 'WITH_AUGMENTED_REALITY',
      name: 'Con realidad aumentada',
      value_id: '242084',
      value_name: 'No',
    },
    {
      id: 'WITH_COLORING_PAGES',
      name: 'Con páginas para colorear',
      value_name: data.coloring ? 'Si' : 'No',
    },
  ],
  channels: data.channels,
});
