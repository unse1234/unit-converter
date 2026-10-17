import type { Locale } from './config';
import type { LocalCategory } from './types';

/** Short, task-specific distinctions, kept separate from each page's arithmetic. */
export const LOCALIZED_GUIDANCE: Record<
  Locale,
  {
    heading: string;
    sources: string;
    precision: string;
    comparison: string;
    categories: Record<LocalCategory, string>;
  }
> = {
  es: {
    heading: 'Unidades y supuestos',
    sources: 'Fuentes y definiciones',
    precision:
      'Los resultados y las tablas se redondean para facilitar la lectura; ≈ indica una aproximación en el cálculo. El convertidor muestra hasta 6 cifras significativas. La conversión no aumenta la precisión de la medida original.',
    comparison: 'Comparación de unidades',
    categories: {
      length:
        'La pulgada y el pie son internacionales: 1 in = 2.54 cm y 1 ft = 0.3048 m, exactamente. El pie topográfico estadounidense antiguo es distinto; estas páginas no lo utilizan.',
      mass: 'La libra es la libra internacional avoirdupois (0.45359237 kg). La onza común y la onza troy son distintas; para metales preciosos comprueba cuál indica tu medida.',
      temperature:
        'Estas páginas convierten temperaturas absolutas. Para diferencias de temperatura se aplica solo el factor de escala, sin sumar ni restar el desplazamiento. El convertidor rechaza temperaturas inferiores a 0 K.',
      volume:
        'El galón estadounidense y el imperial tienen volúmenes distintos. Selecciona el sistema de tu medida antes de convertir; los litros y mililitros son unidades de volumen, no de masa.',
      area: 'El área mide superficies: el factor de longitud se eleva al cuadrado. Una hectárea equivale exactamente a 10000 m²; no es una unidad de longitud.',
      speed:
        'La milla por hora utiliza la milla internacional de 1609.344 m. Al convertir, comprueba también la unidad de tiempo: km/h y m/s no tienen el mismo factor.',
      cooking:
        'La taza de recetas estadounidense, la taza de etiquetas nutricionales y la taza métrica son distintas. Convertir una taza a gramos requiere conocer el ingrediente y su densidad; estas páginas convierten volumen.',
      tv: 'Las pulgadas indican la diagonal, no el ancho. Se supone una pantalla 16:9: ancho = diagonal × 16/√337 y alto = diagonal × 9/√337. Las dimensiones no incluyen marco ni soporte; consulta las medidas del fabricante.',
    },
  },
  pt: {
    heading: 'Unidades e hipóteses',
    sources: 'Fontes e definições',
    precision:
      'Resultados e tabelas são arredondados para facilitar a leitura; ≈ indica uma aproximação no cálculo. O conversor mostra até 6 algarismos significativos. A conversão não aumenta a precisão da medida original.',
    comparison: 'Comparação de unidades',
    categories: {
      length:
        'A polegada e o pé são internacionais: 1 in = 2,54 cm e 1 ft = 0,3048 m, exatamente. O antigo pé topográfico dos Estados Unidos é diferente e não é usado nestas páginas.',
      mass: 'A libra é a libra internacional avoirdupois (0,45359237 kg). A onça comum e a onça troy são diferentes; a arroba desta seção é a convenção brasileira de 15 kg usada no comércio de gado.',
      temperature:
        'Estas páginas convertem temperaturas absolutas. Para diferenças de temperatura, use apenas o fator de escala, sem somar ou subtrair o deslocamento. O conversor rejeita temperaturas inferiores a 0 K.',
      volume:
        'O galão americano e o imperial têm volumes diferentes. Confira o sistema da medida antes de converter; litros e mililitros medem volume, não massa.',
      area: 'Área mede superfície: o fator de comprimento deve ser elevado ao quadrado. O hectare equivale exatamente a 10000 m²; o alqueire é uma convenção regional, então confirme a região no documento da propriedade.',
      speed:
        'A milha por hora usa a milha internacional de 1609,344 m. Confira também a unidade de tempo: km/h e m/s não usam o mesmo fator.',
      cooking:
        'Aqui a xícara de chá usa a convenção de 240 ml; receitas e utensílios podem adotar outras medidas. Há opções de xícara americana e métrica no conversor. Converter xícaras em gramas exige o ingrediente e sua densidade.',
      tv: 'As polegadas indicam a diagonal, não a largura. Supõe-se uma tela 16:9: largura = diagonal × 16/√337 e altura = diagonal × 9/√337. As medidas não incluem moldura nem suporte; confira as dimensões do fabricante.',
    },
  },
  it: {
    heading: 'Unità e ipotesi',
    sources: 'Fonti e definizioni',
    precision:
      'Risultati e tabelle sono arrotondati per facilitarne la lettura; ≈ indica un’approssimazione nel calcolo. Il convertitore mostra fino a 6 cifre significative. La conversione non aumenta la precisione della misura originale.',
    comparison: 'Confronto tra unità',
    categories: {
      length:
        'Il pollice e il piede sono internazionali: 1 in = 2,54 cm e 1 ft = 0,3048 m, esattamente. Il vecchio piede topografico statunitense è diverso e non viene utilizzato in queste pagine.',
      mass: 'La libbra è la libbra internazionale avoirdupois (0,45359237 kg). L’oncia comune e l’oncia troy sono diverse: per i metalli preziosi verifica quale unità indica la misura.',
      temperature:
        'Queste pagine convertono temperature assolute. Per le differenze di temperatura si applica solo il fattore di scala, senza aggiungere o sottrarre lo spostamento. Il convertitore rifiuta temperature inferiori a 0 K.',
      volume:
        'Il gallone statunitense e quello imperiale hanno volumi diversi. Controlla il sistema della misura prima di convertire; litri e millilitri misurano il volume, non la massa.',
      area: 'L’area misura una superficie: il fattore di lunghezza va elevato al quadrato. Un ettaro equivale esattamente a 10000 m² e non è un’unità di lunghezza.',
      speed:
        'Il miglio orario utilizza il miglio internazionale di 1609,344 m. Controlla anche l’unità di tempo: km/h e m/s hanno fattori diversi.',
      cooking:
        'La cup statunitense, la cup per le etichette nutrizionali e la tazza metrica sono diverse. Per convertire un volume in grammi servono l’ingrediente e la sua densità.',
      tv: 'I pollici indicano la diagonale, non la larghezza. Si assume uno schermo 16:9: larghezza = diagonale × 16/√337 e altezza = diagonale × 9/√337. Le misure escludono cornice e supporto; verifica le dimensioni del produttore.',
    },
  },
  fr: {
    heading: 'Unités et hypothèses',
    sources: 'Sources et définitions',
    precision:
      'Les résultats et tableaux sont arrondis pour faciliter la lecture ; ≈ indique une approximation dans le calcul. Le convertisseur affiche jusqu’à 6 chiffres significatifs. Une conversion n’améliore pas la précision de la mesure initiale.',
    comparison: 'Comparaison des unités',
    categories: {
      length:
        'Le pouce et le pied sont internationaux : 1 in = 2,54 cm et 1 ft = 0,3048 m exactement. L’ancien pied topographique américain est différent et n’est pas utilisé ici.',
      mass: 'La livre est la livre internationale avoirdupois (0,45359237 kg), et non la livre française usuelle de 500 g. L’once courante et l’once troy des métaux précieux sont différentes.',
      temperature:
        'Ces pages convertissent des températures absolues. Pour les écarts de température, appliquez uniquement le facteur d’échelle, sans ajouter ni soustraire le décalage. Le convertisseur refuse les températures inférieures à 0 K.',
      volume:
        'Le gallon américain et le gallon impérial ont des volumes différents. Vérifiez le système de votre mesure avant de convertir ; les litres et millilitres mesurent un volume, pas une masse.',
      area: 'L’aire mesure une surface : le facteur de longueur doit être élevé au carré. Un hectare vaut exactement 10000 m² ; ce n’est pas une unité de longueur.',
      speed:
        'Le mille par heure utilise le mille international de 1609,344 m. Vérifiez aussi l’unité de temps : km/h et m/s ont des facteurs différents.',
      cooking:
        'La cup américaine des recettes, la cup des étiquettes nutritionnelles et la tasse métrique diffèrent. Pour convertir un volume en grammes, il faut connaître l’ingrédient et sa masse volumique.',
      tv: 'Les pouces désignent la diagonale et non la largeur. On suppose un écran 16:9 : largeur = diagonale × 16/√337 et hauteur = diagonale × 9/√337. Les mesures excluent cadre et pied ; vérifiez les dimensions du fabricant.',
    },
  },
  id: {
    heading: 'Satuan dan asumsi',
    sources: 'Sumber dan definisi',
    precision:
      'Hasil dan tabel dibulatkan agar mudah dibaca; ≈ menunjukkan pendekatan dalam perhitungan. Kalkulator menampilkan hingga 6 angka signifikan. Konversi tidak meningkatkan ketelitian pengukuran awal.',
    comparison: 'Perbandingan satuan',
    categories: {
      length:
        'Inch dan feet memakai definisi internasional: tepat 1 in = 2,54 cm dan 1 ft = 0,3048 m. Survey foot lama di Amerika Serikat berbeda dan tidak digunakan di halaman ini.',
      mass: 'Pon memakai pound avoirdupois internasional (0,45359237 kg). Ons Indonesia adalah 100 g, berbeda dari ounce internasional dan troy ounce untuk logam mulia. Kuintal memakai konvensi 100 kg.',
      temperature:
        'Halaman ini mengubah suhu absolut. Untuk selisih suhu, gunakan faktor skala saja tanpa penambahan atau pengurangan titik nol. Kalkulator menolak suhu di bawah 0 K.',
      volume:
        'Galon Amerika dan galon Imperial memiliki volume berbeda. Galon air minum adalah ukuran kemasan, sehingga periksa kapasitas pada label. Liter dan mililiter mengukur volume, bukan massa.',
      area: 'Luas mengukur permukaan: faktor panjang harus dikuadratkan. Satu hektar sama dengan tepat 10000 m² dan bukan satuan panjang.',
      speed:
        'Mil per jam memakai mil internasional sepanjang 1609,344 m. Periksa juga satuan waktu: km/jam dan m/s memiliki faktor berbeda.',
      cooking:
        'Cup Amerika untuk resep, cup pada label gizi, dan cup metrik berbeda. Mengubah volume menjadi gram memerlukan jenis bahan dan massa jenisnya.',
      tv: 'Ukuran inch menunjukkan diagonal, bukan panjang layar. Asumsi layar 16:9: panjang = diagonal × 16/√337 dan lebar = diagonal × 9/√337. Ukuran tidak termasuk bingkai dan kaki; periksa dimensi dari produsen.',
    },
  },
};

/** Regional conventions are sourced separately from the SI definitions. */
export const LOCAL_UNIT_SOURCES = [
  {
    units: ['ons-id'],
    title: 'Pemerintah Kabupaten Karawang — ons dan gram',
    url: 'https://karawangkab.go.id/berita/sturada-894-fm-siarkan-pjj-untuk-siswa-sd-kelas-2-dan-5-0',
  },
  {
    units: ['kuintal'],
    title: 'Kementerian Pendidikan dan Kebudayaan — satuan berat',
    url: 'https://repositori.kemdikbud.go.id/18693/1/MTK%20Paket%20A%20Kesehatan%20Masyarakat%20Modul%205_sip%20for%20ISBN.pdf',
  },
  {
    units: ['arroba-br'],
    title: 'Embrapa — arroba de carcaça (15 kg)',
    url: 'https://www.alice.cnptia.embrapa.br/alice/handle/doc/194817',
  },
  {
    units: ['alqueire-paulista', 'alqueire-mineiro', 'alqueire-baiano'],
    title: 'eduCAPES — unidades de medidas agrárias (p. 10)',
    url: 'https://educapes.capes.gov.br/bitstream/capes/921958/2/Produto%20educacional%20Kelli.pdf#page=10',
  },
  {
    units: ['us-legal-cup'],
    title: 'Secretaria Municipal de Educação de Goiânia — xícara de 240 ml',
    url: 'https://sme.goiania.go.gov.br/conexaoescola/eaja/matematica-medidas-de-capacidade-padronizadas-e-nao-padronizadas/',
  },
];
