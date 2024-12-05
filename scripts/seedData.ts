/* eslint-disable no-console */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Woman } from '../src/types/womenTypes';

dotenv.config();

const regions = [
  'Dakar',
  'Thiès',
  'Diourbel',
  'Fatick',
  'Kaolack',
  'Kaffrine',
  'Kolda',
  'Louga',
  'Matam',
  'Saint-Louis',
  'Sédhiou',
  'Tambacounda',
  'Kédougou',
  'Ziguinchor',
];

const departments: { [key: string]: string[] } = {
  Dakar: ['Dakar', 'Pikine', 'Rufisque', 'Guédiawaye'],
  Thiès: ['Thiès', 'Tivaouane', 'Mbour'],
  Diourbel: ['Diourbel', 'Bambey', 'Mbacké'],
  Fatick: ['Fatick', 'Foundiougne', 'Gossas'],
  Kaolack: ['Kaolack', 'Guinguinéo', 'Nioro du Rip'],
  Kaffrine: ['Kaffrine', 'Birkelane', 'Koungheul', 'Malem Hodar'],
  Kolda: ['Kolda', 'Vélingara', 'Médina Yoro Foulah'],
  Louga: ['Louga', 'Kébémer', 'Linguère'],
  Matam: ['Matam', 'Kanel', 'Ranérou'],
  'Saint-Louis': ['Saint-Louis', 'Dagana', 'Podor'],
  Sédhiou: ['Sédhiou', 'Bounkiling', 'Goudomp'],
  Tambacounda: ['Tambacounda', 'Bakel', 'Goudiry', 'Koumpentoum'],
  Kédougou: ['Kédougou', 'Salémata', 'Saraya'],
  Ziguinchor: ['Ziguinchor', 'Bignona', 'Oussouye'],
};

const communes: { [key: string]: string[] } = {
  Dakar: ['Plateau', 'Médina', 'Grand Dakar', 'Almadies'],
  Pikine: ['Pikine Est', 'Pikine Ouest', 'Pikine Nord'],
  Rufisque: ['Rufisque Est', 'Rufisque Ouest', 'Rufisque Nord'],
  Thiès: ['Thiès Est', 'Thiès Ouest', 'Thiès Nord'],
  Mbour: ['Mbour', 'Saly', 'Ngaparou'],
  'Saint-Louis': ['Saint-Louis Nord', 'Saint-Louis Sud', 'Sor'],
  // Add more communes as needed
};

const activities = [
  'Agriculture',
  'Commerce',
  'Artisanat',
  'Transformation alimentaire',
  'Élevage',
  'Pêche',
  'Couture',
  'Coiffure',
  'Restauration',
  'Teinture',
  'Maraîchage',
  'Petit commerce',
  'Savonnerie',
  'Transformation de fruits',
  'Aviculture',
];

const firstNames = [
  'Fatou',
  'Aminata',
  'Mariama',
  'Aïssatou',
  'Rama',
  'Khady',
  'Ndèye',
  'Astou',
  'Sokhna',
  'Adja',
  'Mame',
  'Coumba',
  'Dieynaba',
  'Ramatoulaye',
  'Seynabou',
];

const lastNames = [
  'Diallo',
  'Sow',
  'Ba',
  'Diop',
  'Ndiaye',
  'Fall',
  'Gueye',
  'Sy',
  'Kane',
  'Bâ',
  'Cissé',
  'Thiam',
  'Wade',
  'Mbaye',
  'Sarr',
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomAge(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhoneNumber(): string {
  const prefixes = ['77', '78', '76', '70'];
  const prefix = getRandomElement(prefixes);
  const number = Math.floor(Math.random() * 10000000)
    .toString()
    .padStart(7, '0');
  return prefix + number;
}

async function generateWomen(count: number): Promise<Woman[]> {
  const women: Woman[] = [];

  for (let i = 0; i < count; i++) {
    const region = getRandomElement(regions);
    const department = getRandomElement(departments[region]);
    const communeList = communes[department] || communes[region] || ['Centre'];
    const commune = getRandomElement(communeList);

    const woman: Woman = {
      firstName: getRandomElement(firstNames),
      lastName: getRandomElement(lastNames),
      age: getRandomAge(18, 75),
      region,
      department,
      commune,
      activity: getRandomElement(activities),
      phoneNumber: generatePhoneNumber(),
    };

    women.push(woman);
  }

  return women;
}

const WomanModel = mongoose.model<Woman>(
  'Woman',
  new mongoose.Schema(
    {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      age: { type: Number, required: true },
      region: { type: String, required: true },
      department: { type: String, required: true },
      commune: { type: String, required: true },
      activity: { type: String, required: true },
      phoneNumber: String,
    },
    { timestamps: true }
  )
);

async function seedDatabase(): Promise<void> {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    // Clear existing data
    await WomanModel.deleteMany({});
    console.log('Cleared existing data');

    // Generate and insert new data
    const generatedWomen = await generateWomen(100);
    await WomanModel.insertMany(generatedWomen);
    console.log(`Inserted ${generatedWomen.length} women into the database`);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeding function
seedDatabase();
