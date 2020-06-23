import { mongoose } from './mongooseConnection';
// Get the namespace
import mongooseNamespace from 'mongoose';

export interface IEntry extends mongooseNamespace.Document {
  name: string;
  friendlyName: string;
  links: Array<any>;
  owner: string;
}

const EntrySchema = new mongooseNamespace.Schema({
  name: String,
  friendlyName: String,
  links: Array,
  owner: String,
});

export default mongoose.model<IEntry>('Entry', EntrySchema);
