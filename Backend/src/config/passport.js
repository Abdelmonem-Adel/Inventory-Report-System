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

        // 1. Only allow @breadfast.com emails
        if (!email.endsWith('@breadfast.com')) {
          return done(null, false, { message: 'not_breadfast' });
        }

        // 2. Check if user with this googleId exists
        let user = await User.findOne({ googleId: id });
        if (user) {
          return done(null, user);
        }

        // 3. Check if user with this email exists in DB (link Google account)
        user = await User.findOne({ email });
        if (user) {
          user.googleId = id;
          if (!user.picture) user.picture = picture;
          await user.save();
          return done(null, user);
        }

        // 4. User NOT found in DB → contact admin (no auto-creation)
        return done(null, false, { message: 'not_registered' });

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
