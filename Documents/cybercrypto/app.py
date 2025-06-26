from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_sqlalchemy import SQLAlchemy  
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_wtf import FlaskForm, CSRFProtect
from flask_talisman import Talisman
from wtforms import StringField, PasswordField, EmailField, SubmitField
from wtforms.validators import DataRequired, Email, Length, EqualTo
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import logging
import secrets
from config import Config

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)
app.config['SQLALCHEMY_DATABASE_URI'] = Config.DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- MODELES SQLALCHEMY ---
class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(512), nullable=False)  # <-- Correction ici
    is_admin = db.Column(db.Boolean, default=False)
    failed_login_attempts = db.Column(db.Integer, default=0)
    locked_until = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def is_locked(self):
        return self.locked_until and datetime.utcnow() < self.locked_until

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    post_count = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)

# --- INITIALISATION DE LA BASE ---
@app.cli.command('init-db')
def init_db_command():
    """Crée les tables et insère les données initiales."""
    db.create_all()
    # Catégories par défaut
    default_categories = [
        ('Threat Analysis', 'Latest threats, malware analysis, and security incidents'),
        ('Cryptography', 'Encryption algorithms, protocols, and implementation'),
        ('Career Guidance', 'Certifications, job opportunities, and career paths'),
        ('Tools & Scripts', 'Security tools, scripts, and automation'),
        ('Learning Resources', 'Tutorials, courses, and educational materials'),
        ('General Security', 'Best practices, policies, and general discussions')
    ]
    for name, desc in default_categories:
        if not Category.query.filter_by(name=name).first():
            db.session.add(Category(
                name=name,
                description=desc,
                post_count=secrets.randbelow(1000) + 400
            ))
    # Admin par défaut
    if not User.query.filter_by(username='admin').first():
        admin = User(
            username='admin',
            email='admin@cybercrypto.com',
            password_hash=generate_password_hash('admin123'),
            is_admin=True
        )
        db.session.add(admin)
    db.session.commit()
    print('Base de données initialisée.')

# --- SÉCURITÉ ET EXTENSIONS ---
csrf = CSRFProtect(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message = 'Please log in to access this page.'
login_manager.login_message_category = 'warning'
talisman = Talisman(app, **app.config['TALISMAN_CONFIG'])

logging.basicConfig(
    filename=app.config['LOG_FILE'],
    level=getattr(logging, app.config['LOG_LEVEL']),
    format='%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
)

# --- HELPERS ---
def get_user_by_id(user_id):
    return User.query.get(int(user_id))

def get_user_by_username(username):
    return User.query.filter_by(username=username).first()

@login_manager.user_loader
def load_user(user_id):
    return get_user_by_id(user_id)

# --- FORMS ---
class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=20)])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])
    submit = SubmitField('Login')

class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=20)])
    email = EmailField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=8)])
    password2 = PasswordField('Confirm Password',
                              validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Join Forum')

# --- ERROR HANDLERS ---
@app.errorhandler(404)
def not_found_error(error):
    app.logger.warning(f'404 error: {request.url}')
    return render_template('error.html', error_code=404,
                         error_message='Page not found'), 404

@app.errorhandler(500)
def internal_error(error):
    app.logger.error(f'500 error: {error}')
    return render_template('error.html', error_code=500,
                         error_message='Internal server error'), 500

# --- ROUTES ---
@app.route('/')
def index():
    """Homepage with community stats and resources"""
    # Mock community stats (in production, these would come from the database)
    stats = {
        'members': 12847,
        'discussions': 4923,
        'daily_views': 28391,
        'active_today': 2156
    }
    # Mock resource data
    resources = [
        {'name': 'NIST Cybersecurity Framework', 'type': 'Guide', 'downloads': 2300},
        {'name': 'OWASP Top 10 2024', 'type': 'Report', 'downloads': 1800},
        {'name': 'Cryptography Handbook', 'type': 'eBook', 'downloads': 1200},
        {'name': 'Security Tools Catalog', 'type': 'Database', 'downloads': 945}
    ]
    return render_template('index.html', stats=stats, resources=resources)

@app.route('/discussions')
def discussions():
    """Discussions page with categories"""
    categories = Category.query.filter_by(is_active=True).all()
    return render_template('discussions.html', categories=categories)

@app.route('/resources')
def resources():
    """Resources page"""
    # Mock resources data
    resources = [
        {
            'title': 'NIST Cybersecurity Framework',
            'description': 'Comprehensive framework for improving cybersecurity posture',
            'type': 'Guide',
            'downloads': 2300,
            'file_size': '2.1 MB'
        },
        {
            'title': 'OWASP Top 10 2024',
            'description': 'Latest web application security risks',
            'type': 'Report',
            'downloads': 1800,
            'file_size': '1.8 MB'
        },
        {
            'title': 'Cryptography Handbook',
            'description': 'Complete guide to modern cryptographic techniques',
            'type': 'eBook',
            'downloads': 1200,
            'file_size': '5.4 MB'
        },
        {
            'title': 'Security Tools Catalog',
            'description': 'Comprehensive database of cybersecurity tools',
            'type': 'Database',
            'downloads': 945,
            'file_size': '3.2 MB'
        }
    ]
    return render_template('resources.html', resources=resources)

@app.route('/events')
def events():
    """Events page"""
    return render_template('events.html')

@app.route('/careers')
def careers():
    """Careers page"""
    return render_template('careers.html')

@app.route('/members')
@login_required
def members():
    """Members page (requires login)"""
    return render_template('members.html')

@app.route('/leaderboard')
def leaderboard():
    """Leaderboard page"""
    return render_template('leaderboard.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Login page with rate limiting and account lockout"""
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = LoginForm()
    if form.validate_on_submit():
        user = get_user_by_username(form.username.data)
        if user and not user.is_locked():
            if user.check_password(form.password.data):
                user.failed_login_attempts = 0
                user.locked_until = None
                db.session.commit()
                login_user(user, remember=False)
                app.logger.info(f'Successful login: {user.username}')
                next_page = request.args.get('next')
                if not next_page or not next_page.startswith('/'):
                    next_page = url_for('index')
                return redirect(next_page)
            else:
                user.failed_login_attempts += 1
                if user.failed_login_attempts >= app.config['MAX_LOGIN_ATTEMPTS']:
                    user.locked_until = datetime.utcnow() + app.config['LOCKOUT_DURATION']
                    flash(f'Account locked for {app.config["LOCKOUT_DURATION"].total_seconds()/60} minutes due to too many failed attempts.', 'error')
                    app.logger.warning(f'Account locked: {user.username}')
                else:
                    remaining = app.config['MAX_LOGIN_ATTEMPTS'] - user.failed_login_attempts
                    flash(f'Invalid credentials. {remaining} attempts remaining.', 'error')
                db.session.commit()
                app.logger.warning(f'Failed login attempt: {form.username.data}')
        elif user and user.is_locked():
            flash('Account is temporarily locked. Please try again later.', 'error')
        else:
            flash('Invalid username or password.', 'error')
            app.logger.warning(f'Failed login attempt: {form.username.data}')
    return render_template('login.html', form=form)

@app.route('/logout')
@login_required
def logout():
    """Logout user"""
    username = current_user.username
    logout_user()
    app.logger.info(f'User logged out: {username}')
    flash('You have been logged out successfully.', 'info')
    return redirect(url_for('index'))

@app.route('/join', methods=['GET', 'POST'])
def join():
    """Join forum (registration) page"""
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = RegistrationForm()
    if form.validate_on_submit():
        if User.query.filter((User.username == form.username.data) | (User.email == form.email.data)).first():
            flash('Username or email already exists.', 'error')
        else:
            password_hash = generate_password_hash(form.password.data)
            new_user = User(
                username=form.username.data,
                email=form.email.data,
                password_hash=password_hash
            )
            db.session.add(new_user)
            db.session.commit()
            flash('Registration successful! Please log in.', 'success')
            app.logger.info(f'New user registered: {form.username.data}')
            return redirect(url_for('login'))
    return render_template('join.html', form=form)

# API endpoints for dynamic content
@app.route('/api/stats')
def api_stats():
    """API endpoint for community stats"""
    stats = {
        'members': 12847,
        'discussions': 4923,
        'daily_views': 28391,
        'active_today': 2156
    }
    return jsonify(stats)

@app.route('/api/search')
def api_search():
    """API endpoint for search functionality"""
    query = request.args.get('q', '').strip()
    if not query or len(query) < 3:
        return jsonify({'error': 'Query must be at least 3 characters'}), 400
    # Mock search results (in production, this would search the database)
    results = [
        {'title': f'Search result for: {query}', 'category': 'General Security'},
        {'title': f'Another result for: {query}', 'category': 'Threat Analysis'}
    ]
    app.logger.info(f'Search query: {query}')
    return jsonify({'results': results})

from app import db, app

with app.app_context():
    db.drop_all()      # Supprime toutes les tables
    db.create_all()    # Recrée toutes les tables
    print("Base de données réinitialisée.")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)