print("Started Adding the Users.");

db.createUser({
  user: "root",
  pwd: "local",
  roles: [{ role: "readWrite", db: "nfkey" }],
});
