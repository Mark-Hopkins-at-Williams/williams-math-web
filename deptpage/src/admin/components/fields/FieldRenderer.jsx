import TextField from './TextField'
import DateField from './DateField'
import SelectField from './SelectField'
import ImagePickerField from './ImagePickerField'
import ArticleField from './ArticleField'
import ReferenceField from './ReferenceField'
import ReferenceListField from './ReferenceListField'
import ReferenceStringListField from './ReferenceStringListField'
import StringListField from './StringListField'
import StringImageArrayField from './StringImageArrayField'
import RepeatableGroupField from './RepeatableGroupField'

const FIELD_COMPONENTS = {
  text: TextField,
  date: DateField,
  select: SelectField,
  image: ImagePickerField,
  article: ArticleField,
  reference: ReferenceField,
  'reference-list': ReferenceListField,
  'reference-string-list': ReferenceStringListField,
  'string-list': StringListField,
  'string-image-array': StringImageArrayField,
  'repeatable-group': RepeatableGroupField,
}

const FieldRenderer = (props) => {
  const Component = FIELD_COMPONENTS[props.field.type]
  if (!Component) {
    return <div className="admin-error">unknown field type: {props.field.type}</div>
  }
  return <Component {...props} />
}

export default FieldRenderer
