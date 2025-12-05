from app import create_app


app = create_app()


if __name__ == '__main__':
# Fixed indentation
    app.run(debug=True)