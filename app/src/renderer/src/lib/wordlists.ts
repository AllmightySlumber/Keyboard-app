export type FingerGroup = 'index' | 'majeur' | 'annulaire' | 'auriculaire' | 'complet'

// Words built mostly from home-row / common letters so each list leans on
// the finger it's named after, while staying readable French.
const WORDLISTS: Record<FingerGroup, string[]> = {
  index: ['bon', 'jeu', 'gant', 'nuit', 'bain', 'humain', 'jardin', 'nature', 'urgent', 'rugby'],
  majeur: ['ide', 'ici', 'idee', 'dire', 'kiki', 'aide', 'cidre', 'dicte', 'idiot', 'oiseau'],
  annulaire: ['les', 'elle', 'elles', 'belle', 'lesse', 'sole', 'salle', 'pelle', 'selle', 'ole'],
  auriculaire: ['azur', 'pizza', 'wagon', 'puzzle', 'mezzo', 'amazone', 'oxyde', 'wapiti', 'zoo', 'point'],
  complet: [
    'le', 'la', 'de', 'et', 'un', 'une', 'pour', 'avec', 'sur', 'dans',
    'bonjour', 'merci', 'maison', 'jardin', 'voiture', 'lumiere', 'musique',
    'ordinateur', 'clavier', 'ecran', 'fenetre', 'rapide', 'lent', 'simple',
    'projet', 'travail', 'equipe', 'reunion', 'cafe', 'soleil', 'nuage',
    'voyage', 'histoire', 'science', 'nature', 'famille', 'enfant', 'ecole'
  ]
}

export function generateText(group: FingerGroup, wordCount = 25): string {
  const list = WORDLISTS[group]
  const words: string[] = []
  for (let i = 0; i < wordCount; i++) {
    words.push(list[Math.floor(Math.random() * list.length)])
  }
  return words.join(' ')
}
