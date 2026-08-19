import markdown
from xhtml2pdf import pisa
import os

def convert_md_to_pdf(md_file_path, pdf_file_path):
    with open(md_file_path, 'r', encoding='utf-8') as f:
        md_text = f.read()

    html_content = markdown.markdown(md_text, extensions=['tables', 'fenced_code'])

    styled_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Zorabase System Architecture Guide</title>
        <style>
            @page {{
                size: a4 portrait;
                margin: 20mm 15mm 20mm 15mm;
            }}
            body {{
                font-family: Helvetica, Arial, sans-serif;
                font-size: 9pt;
                line-height: 1.5;
                color: #27272a;
            }}
            h1 {{
                font-size: 18pt;
                color: #18181b;
                border-bottom: 2px solid #4f46e5;
                padding-bottom: 5px;
                margin-top: 0;
                margin-bottom: 10px;
            }}
            h2 {{
                font-size: 13pt;
                color: #312e81;
                border-bottom: 1px solid #e4e4e7;
                padding-bottom: 3px;
                margin-top: 18px;
                margin-bottom: 8px;
            }}
            h3 {{
                font-size: 10.5pt;
                color: #4338ca;
                margin-top: 12px;
                margin-bottom: 6px;
            }}
            h4 {{
                font-size: 9.5pt;
                color: #1e1b4b;
                margin-top: 10px;
                margin-bottom: 4px;
            }}
            p {{
                margin-top: 0;
                margin-bottom: 6px;
            }}
            blockquote {{
                background-color: #f4f4f5;
                border-left: 3px solid #6366f1;
                margin: 8px 0;
                padding: 6px 10px;
                color: #3f3f46;
            }}
            pre {{
                background-color: #18181b;
                color: #f4f4f5;
                padding: 8px;
                font-family: Courier, monospace;
                font-size: 7pt;
                line-height: 1.3;
                margin: 8px 0;
            }}
            code {{
                font-family: Courier, monospace;
                font-size: 8pt;
                background-color: #f4f4f5;
                color: #4f46e5;
            }}
            table {{
                width: 100%;
                border-collapse: collapse;
                margin: 10px 0;
                font-size: 8pt;
            }}
            th, td {{
                border: 1px solid #e4e4e7;
                padding: 5px 6px;
                text-align: left;
            }}
            th {{
                background-color: #f4f4f5;
                font-weight: bold;
                color: #18181b;
            }}
            ul, ol {{
                margin-top: 0;
                margin-bottom: 6px;
                padding-left: 18px;
            }}
            li {{
                margin-bottom: 3px;
            }}
            hr {{
                border: 0;
                height: 1px;
                background-color: #e4e4e7;
                margin: 14px 0;
            }}
        </style>
    </head>
    <body>
        {html_content}
    </body>
    </html>
    """

    with open(pdf_file_path, "wb") as pdf_file:
        pisa_status = pisa.CreatePDF(styled_html, dest=pdf_file)

    if pisa_status.err:
        print(f"Error generating PDF: {pisa_status.err}")
        return False
    else:
        print(f"Successfully generated PDF: {pdf_file_path}")
        return True

if __name__ == "__main__":
    md_path = os.path.join(os.path.dirname(__file__), "INTERVIEW_SYSTEM_ARCHITECTURE.md")
    pdf_path = os.path.join(os.path.dirname(__file__), "Zorabase_System_Architecture_Guide.pdf")
    convert_md_to_pdf(md_path, pdf_path)
