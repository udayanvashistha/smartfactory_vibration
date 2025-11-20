const TextInput = ({ label, hint, ...inputProps }) => {
  return (
    <label className="form-field">
      <span className="form-field__label">
        {label}
        {inputProps?.required && <span aria-hidden="true">*</span>}
      </span>
      <input className="form-field__control" {...inputProps} />
      {hint && <small className="form-field__hint">{hint}</small>}
    </label>
  )
}

export default TextInput
