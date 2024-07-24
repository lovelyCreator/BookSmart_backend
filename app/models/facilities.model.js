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
        contactEmail: {
            type: String,
            required: true,
        },
        contactPhone: {
            type: Number,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        contactPassword: {
            type: String,
            default: ''
        },
        facilityAcknowledgeTerm: {
            type: Boolean,
            default: false
        },
        signature: {
            type: String,
            default: ''
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
    });

    schema.method("toJSON", function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const Facility = mongoose.model("Facility", schema);
    return Facility;
};
