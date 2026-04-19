import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../DB/models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      proxy: true // Required for VPS/Nginx
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, displayName, emails, photos } = profile;
        const email = emails[0].value;
        const picture = photos[0].value;

        // 1. Check if user with this googleId exists
        let user = await User.findOne({ googleId: id });

        if (user) {
          return done(null, user);
        }

        // 2. If not, check if user with this email exists (Link existing email accounts)
        user = await User.findOne({ email });

        if (user) {
          user.googleId = id;
          if (!user.picture) user.picture = picture;
          await user.save();
          return done(null, user);
        }

        // 3. Create new user
        user = await User.create({
          googleId: id,
          name: displayName,
          email: email,
          picture: picture,
          role: 'keeper' // Default role
        });

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
