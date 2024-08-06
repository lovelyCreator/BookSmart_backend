module.exports = mongoose => {
  var schema = mongoose.Schema({
      userStatus: {
          type: Boolean,
          default: false
      },
      userRole: {
          type: String,
          default: '',
          // required:true,
      }
      ,
      entryDate: {
          type: Date,
          default: Date.now,
      },
      companyName: {
          type: String,
          default: '',
      },
      firstName: {
          type: String,
          required: true
      },
      lastName: {
          type: String,
          required: true
      },
      email: {
          type: String,
          required: true,
      },
      phone: {
          type: Number,
          required: true,
      },
      password: {
          type: String,
          required: true,
      },
      address: {
          street: { type: String, required: true, default: '' },
          street2: { type: String, default: '' },
          city: { type: String, default: '' },
          state: { type: String, default: '' },
          zip: { type: String, default: '' },
      },
      avatar: {
          content: { type: String, default: '' },
          type: { type: String, default: '' },
          name: { type: String, default: '' }
      },
      logined: {
        type: Boolean,
        default: false
      }
  });

  schema.method("toJSON", function () {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
  });

  const Admin = mongoose.model("Admin", schema);
  return Admin;
};
