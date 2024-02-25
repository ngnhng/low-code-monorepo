package user

const (
	TableUser = "users"
)

type User struct {
	Id           string `bson:"_id" json:"_id"`
	FirstName    string `bson:"first_name" json:"first_name"`
	LastName     string `bson:"last_name" json:"last_name"`
	Email        string `bson:"email" json:"email"`
	ProfileImage string `bson:"profile_image" json:"profile_image"`
}
