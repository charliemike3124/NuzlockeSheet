export default function User(
    uid = null,
    name = null,
    email = null,
    photoURL = null
) {
    return {
        uid: uid,
        name: name,
        email: email,
        photoURL: photoURL,
    };
}
