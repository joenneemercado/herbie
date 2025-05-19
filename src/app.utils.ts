export function fixEncodingIssues(text: string): string {
  if (!text) return text;

  return text
    .replace(/ÃƒÂ/g, 'Ã') // Substitui o "NÃƒO" pelo "NÃO"
    .replace(/Ã¢/g, 'â')
    .replace(/Ãª/g, 'ê')
    .replace(/Ã©/g, 'é')
    .replace(/Ã³/g, 'ó')
    .replace(/Ã¡/g, 'á')
    .replace(/Ã£/g, 'ã')
    .replace(/Ã§/g, 'ç')
    .replace(/Ãº/g, 'ú')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã³/g, 'ó')
    .replace(/Ã³/g, 'ó')
    .replace(/Ã³/g, 'ó');
  // Adicione outras substituições conforme necessário
}

export function splitName(fullName: string): {
  firstname: string;
  lastname: string;
} {
  // Dividindo o nome completo em partes usando o espaço como delimitador
  const nameParts = fullName?.trim().split(/\s+/);
  if (!fullName) {
    return {
      firstname: '',
      lastname: '',
    };
  }
  // Se houver mais de um nome, o primeiro é o firstname e o último é o lastname
  if (nameParts.length > 1) {
    const firstname = nameParts.slice(0, -1).join(' '); // Pega tudo exceto o último
    const lastname = nameParts[nameParts.length - 1]; // Pega o último nome
    return { firstname, lastname };
  } else {
    // Se houver apenas um nome, ele é o firstname e o lastname fica vazio
    return { firstname: nameParts[0], lastname: '' };
  }
}

// Mapas de Normalização (adicione mais conforme necessário)
export const genderMap = {
  Masculino: 'Male',
  Feminino: 'Female',
  Outro: 'Other',
  // Adicione outras variações que podem vir da VTEX
};

export const maritalStatusMap = {
  'Solteiro(a)': 'single',
  Solteiro: 'single',
  Solteira: 'single',
  'Casado(a)': 'married',
  Casado: 'married',
  Casada: 'married',
  'Divorciado(a)': 'divorced',
  'Viúvo(a)': 'widowed',
  // Adicione outras variações
};

// Função para obter valor normalizado ou o original se não mapeado
export function getNormalizedValue(value, map) {
  if (value && map[value]) {
    return map[value];
  }
  return value; // Ou null/undefined se preferir não gravar o valor não mapeado
}
