import { dbContext } from "../db/DbContext";

// Private Methods

/**
 * Creates profile if one does not exist
 * @param {any} profile
 * @param {any} user
 */
async function createProfileIfNeeded(profile, user) {
  if (!profile) {
    profile = await dbContext.Profile.create({
      ...user,
      subs: [user.sub]
    });
  }
  return profile;
}

/**
 * Adds sub to profile if not already on profile
 * @param {any} profile
 * @param {any} user
 */
async function mergeSubsIfNeeded(profile, user) {
  if (!profile.subs.includes(user.sub)) {
    // @ts-ignore
    profile.subs.push(user.sub);
    await profile.save();
  }
}
/**
 * Restricts changes to the body of the profile object
 * @param {any} body
 */
function sanitizeBody(body) {
  let writable = {
    name: body.name,
    phones: body.phones,
    addresses: body.addresses,
    notes: body.notes,
    picture: body.picture
  };
  return writable;
}

class ProfileService {
  async getProfile(user) {
    let profile = await dbContext.Profile.findOne({
      email: user.email
    });
    profile = await createProfileIfNeeded(profile, user);
    await mergeSubsIfNeeded(profile, user);
    return profile;
  }
  async updateProfile(user, body) {
    let update = sanitizeBody(body);
    let profile = await dbContext.Profile.findOneAndUpdate(
      { email: user.email },
      { $set: update },
      { runValidators: true, setDefaultsOnInsert: true, new: true }
    );
    return profile;
  }
  async updatePic(pic, user) {
    let profile = await dbContext.Profile.findOneAndUpdate({ email: user.email },
      { picture: pic },
      { new: true })
    return profile
  }
}
export const profilesService = new ProfileService();
