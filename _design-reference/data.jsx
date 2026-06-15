// data.jsx — dados de exemplo (seleções, cromos, grupo)

// 14 seleções com sigla + emoji de bandeira (placeholders, sem assets oficiais)
const COUNTRIES = [
  { code:'BRA', name:'Brasil',        flag:'🇧🇷', n:18 },
  { code:'ARG', name:'Argentina',     flag:'🇦🇷', n:18 },
  { code:'FRA', name:'França',        flag:'🇫🇷', n:18 },
  { code:'ESP', name:'Espanha',       flag:'🇪🇸', n:18 },
  { code:'POR', name:'Portugal',      flag:'🇵🇹', n:18 },
  { code:'GER', name:'Alemanha',      flag:'🇩🇪', n:18 },
  { code:'ENG', name:'Inglaterra',    flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', n:18 },
  { code:'MEX', name:'México',        flag:'🇲🇽', n:18 },
  { code:'USA', name:'EUA',           flag:'🇺🇸', n:18 },
  { code:'CAN', name:'Canadá',        flag:'🇨🇦', n:18 },
  { code:'JPN', name:'Japão',         flag:'🇯🇵', n:18 },
  { code:'KOR', name:'Coreia do Sul', flag:'🇰🇷', n:18 },
  { code:'RSA', name:'África do Sul', flag:'🇿🇦', n:18 },
  { code:'MAR', name:'Marrocos',      flag:'🇲🇦', n:18 },
];

// gera o código do cromo: BRA-01 ... BRA-18
function stickerCode(country, i){ return `${country}-${String(i).padStart(2,'0')}`; }

// PRNG determinístico p/ um estado inicial realista e estável
function seedRand(s){ let x = Math.sin(s) * 10000; return x - Math.floor(x); }

// monta o estado inicial dos cromos do usuário
// status: 'none' | 'got' | 'duplicate' | 'trading'
function buildInitialStickers(){
  const map = {};
  let seed = 1;
  COUNTRIES.forEach((c, ci) => {
    for(let i=1;i<=c.n;i++){
      const code = stickerCode(c.code, i);
      const r = seedRand(seed++);
      let status='none', qty=0;
      // primeiras seleções mais completas, p/ dar variedade
      const bias = ci < 4 ? 0.78 : ci < 9 ? 0.6 : 0.4;
      if(r < bias){
        const r2 = seedRand(seed++);
        if(r2 < 0.62){ status='got'; qty=1; }
        else if(r2 < 0.86){ status='duplicate'; qty = 2 + Math.floor(seedRand(seed++)*3); }
        else { status='trading'; qty=1; }
      }
      map[code] = { status, qty };
    }
  });
  return map;
}

// membros do grupo (outros usuários) com suas repetidas
const GROUP_MEMBERS = [
  { user:'rafa_cards',   dups:{ 'BRA-03':2,'ARG-07':3,'FRA-11':2,'ESP-02':4,'JPN-09':2,'MAR-05':1 } },
  { user:'bia.troca',    dups:{ 'BRA-12':1,'GER-04':2,'POR-08':2,'USA-15':3,'KOR-01':2,'CAN-06':1 } },
  { user:'joao_panini',  dups:{ 'ARG-01':2,'ENG-13':2,'MEX-04':5,'RSA-09':2,'FRA-03':1,'BRA-07':2 } },
  { user:'duda99',       dups:{ 'ESP-10':2,'JPN-02':3,'POR-14':2,'CAN-11':2,'GER-16':1,'BRA-03':1 } },
  { user:'marcos.silva', dups:{ 'USA-05':2,'MAR-12':2,'KOR-07':3,'ENG-02':2,'ARG-07':1,'FRA-11':1 } },
];

const COUNTRY_BY_CODE = Object.fromEntries(COUNTRIES.map(c => [c.code, c]));
function countryOf(stickerCode){ return COUNTRY_BY_CODE[stickerCode.split('-')[0]]; }

const STATUS_META = {
  none:      { key:'none',  label:'Falta',     short:'Não tenho',  color:'var(--st-none-ink)', desc:'Ainda não colei' },
  got:       { key:'got',   label:'Tenho',     short:'Colado',     color:'var(--st-got)',      desc:'Já está no álbum' },
  duplicate: { key:'dup',   label:'Repetida',  short:'Repetida',   color:'var(--st-dup)',      desc:'Tenho de sobra' },
  trading:   { key:'trade', label:'Em troca',  short:'Em troca',   color:'var(--st-trade)',    desc:'Reservada numa proposta' },
};

window.TROCAE = { COUNTRIES, GROUP_MEMBERS, stickerCode, buildInitialStickers, countryOf, COUNTRY_BY_CODE, STATUS_META };
