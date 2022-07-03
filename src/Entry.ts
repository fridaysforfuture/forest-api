import { mongoose } from './mongooseConnection';
// Get the namespace
import mongooseNamespace from 'mongoose';

export interface ISocialLinks extends mongooseNamespace.Document {
  telegram: string | null;
  whatsapp: string | null;
  instagram: string | null;
  twitter: string | null;
  facebook: string | null;
  website: string | null;
  matrix: string | null;
  signal: string | null;
  tiktok: string | null;
  mastodon: string | null;
  youtube: string | null;
  linkedin: string | null;
}
export interface IEntry extends mongooseNamespace.Document {
  name: string;
  friendlyName: string;
  links: Array<any>;
  owner: string;
  sharedTo: Array<string>;
  socialLinks: ISocialLinks;
}

const EntrySchema = new mongooseNamespace.Schema({
  name: String,
  friendlyName: String,
  links: Array,
  owner: String,
  sharedTo: Array,
  socialLinks: {
    type: Object,
    required: true,
  },
},
{ minimize: false },
);

export default mongoose.model<IEntry>('Entry', EntrySchema);
