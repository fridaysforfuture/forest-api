import { mongoose } from './mongooseConnection';
// Get the namespace
import mongooseNamespace from 'mongoose';

export interface IEntry extends mongooseNamespace.Document {
  name: string;
  friendlyName: string;
  lastName: string;
  links: Array<any>;
}

const EntrySchema = new mongooseNamespace.Schema({
  name: String,
  friendlyName: String,
  links: Array
});

export default mongoose.model<IEntry>('Entry', EntrySchema);
