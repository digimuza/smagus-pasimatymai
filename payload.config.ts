import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { fileURLToPath } from 'url';

import { Categories } from './collections/Categories';
import { GameSessions } from './collections/GameSessions';
import { Questions } from './collections/Questions';
import { QuestionEvents } from './collections/QuestionEvents';
import { SpicyCardTypes } from './collections/SpicyCardTypes';
import { SpicyCards } from './collections/SpicyCards';
import { Audiences } from './collections/Audiences';
import { Players } from './collections/Players';
import { PlayerProgress } from './collections/PlayerProgress';
import { Subscriptions } from './collections/Subscriptions';
import { DailyQuestions } from './collections/DailyQuestions';
import { QuestionSubmissions } from './collections/QuestionSubmissions';
import { Users } from './collections/Users';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  editor: lexicalEditor(),
  collections: [Users, Players, PlayerProgress, Subscriptions, Categories, Questions, SpicyCardTypes, SpicyCards, GameSessions, QuestionEvents, Audiences, DailyQuestions, QuestionSubmissions],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      beforeDashboard: ['./components/admin/DashboardStats'],
      afterDashboard: ['./components/admin/StatisticsDashboard'],
    },
  },
});
