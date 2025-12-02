"""
Script to test vector embeddings with dummy data.

This script:
1. Creates dummy notes in the database
2. Embeds them into chunks
3. Performs semantic searches and displays results

Usage:
    python scripts/test_vector_search.py <user_id>
    
    If user_id is not provided, it will try to use an existing user from the database.
    To get a valid user_id, create a user through your auth system first.
"""

import os
import sys
from dotenv import load_dotenv

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import get_supabase_admin
from app.core.embeddings import prepare_note_for_embedding, embed_chunks
import uuid

load_dotenv()

# Dummy data
DUMMY_NOTES = [
    {
        "title": "Machine Learning Fundamentals",
        "content": """
Machine learning is a subset of artificial intelligence that focuses on algorithms and statistical models
that enable computers to learn from data without being explicitly programmed. 

The main types of machine learning are:
- Supervised Learning: Models trained on labeled data
- Unsupervised Learning: Models that find patterns in unlabeled data
- Reinforcement Learning: Models that learn through rewards and penalties

Neural networks are inspired by biological neurons and consist of interconnected nodes organized in layers.
Each connection has a weight that is adjusted during training to minimize error.

Deep learning uses multiple layers of neural networks to process information hierarchically,
enabling complex pattern recognition and feature extraction.
        """
    },
    {
        "title": "Natural Language Processing",
        "content": """
Natural Language Processing (NLP) is a field of artificial intelligence focused on enabling computers
to understand, interpret, and generate human language in a meaningful way.

Key NLP tasks include:
- Text Classification: Categorizing text into predefined categories
- Named Entity Recognition: Identifying and classifying named entities in text
- Sentiment Analysis: Determining the emotional tone of text
- Machine Translation: Translating text from one language to another

Transformers have revolutionized NLP by introducing the attention mechanism, which allows models
to focus on relevant parts of the input sequence. Models like BERT and GPT use transformer architecture.

Word embeddings like Word2Vec and GloVe represent words as dense vectors in a continuous space,
capturing semantic relationships between words.
        """
    },
    {
        "title": "Computer Vision Applications",
        "content": """
Computer Vision is the field of artificial intelligence that enables computers to interpret and understand
the visual world using digital images and videos.

Common computer vision tasks include:
- Image Classification: Assigning labels to images
- Object Detection: Locating and identifying objects in images
- Image Segmentation: Partitioning images into semantic regions
- Facial Recognition: Identifying and verifying faces

Convolutional Neural Networks (CNNs) are particularly effective for computer vision tasks.
They use convolutional layers to extract spatial features from images through learned filters.

The ImageNet dataset was instrumental in advancing computer vision by providing millions of labeled images
for training deep learning models like AlexNet, ResNet, and VGG.
        """
    },
    {
        "title": "Data Science and Analytics",
        "content": """
Data Science combines domain knowledge, programming skills, and statistics to extract meaningful insights
from data. It involves collecting, cleaning, analyzing, and visualizing data.

The data science workflow typically includes:
- Problem Definition: Understanding the business problem
- Data Collection: Gathering relevant data
- Data Cleaning: Handling missing values and outliers
- Exploratory Data Analysis: Understanding data patterns
- Modeling: Building predictive or descriptive models
- Evaluation: Assessing model performance
- Deployment: Putting models into production

Feature engineering is crucial for creating meaningful variables that improve model performance.
Good features can make the difference between a mediocre and an excellent model.

Common tools in data science include Python (pandas, scikit-learn), R, SQL, and visualization tools like Tableau.
        """
    },
    {
        "title": "Cloud Computing and Deployment",
        "content": """
Cloud computing provides on-demand access to computing resources over the internet without needing
to own and maintain physical servers.

Major cloud providers include:
- Amazon Web Services (AWS): Offers EC2, S3, Lambda, and many other services
- Google Cloud Platform (GCP): Provides BigQuery, Cloud ML, and more
- Microsoft Azure: Includes AI services, databases, and computing resources

Containerization with Docker allows applications to run consistently across different environments.
Kubernetes orchestrates containers at scale, managing deployment, scaling, and networking.

Serverless computing with Lambda or Cloud Functions allows running code without provisioning servers,
paying only for the compute time used.

APIs enable communication between different software systems, allowing seamless integration of services.
        """
    }
]

# Search queries to test
TEST_QUERIES = [
    "How do neural networks work?",
    "What is natural language processing?",
    "Computer vision for image recognition",
    "Data analysis and machine learning",
    "Cloud infrastructure and deployment",
    "Deep learning architectures",
    "Text embeddings and semantic search"
]

def create_test_user_and_notes(supabase, user_id: str):
    """Create dummy notes for testing."""
    print(f"\n📝 Creating {len(DUMMY_NOTES)} dummy notes...")
    
    created_notes = []
    for note_data in DUMMY_NOTES:
        note = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "title": note_data["title"],
            "content": note_data["content"].strip(),
            "basic_stats": None
        }
        created_notes.append(note)
    
    # Insert notes
    response = supabase.table("notes").insert(created_notes).execute()
    print(f"✅ Created {len(response.data)} notes")
    return response.data


def embed_all_notes(supabase, user_id: str, notes: list):
    """Embed all notes into chunks."""
    print(f"\n🔗 Embedding notes into chunks...")
    
    total_chunks = 0
    
    for note in notes:
        try:
            # Chunk the note
            chunks = prepare_note_for_embedding(
                title=note["title"],
                content=note["content"],
                chunk_size=500
            )
            
            if not chunks:
                continue
            
            # Embed chunks
            embedded_chunks = embed_chunks(chunks)
            
            # Prepare records for database
            chunk_records = [
                {
                    "id": str(uuid.uuid4()),
                    "note_id": note["id"],
                    "user_id": user_id,
                    "chunk_index": chunk["chunk_index"],
                    "total_chunks": chunk["total_chunks"],
                    "content": chunk["content"],
                    "embedding": chunk["embedding"]
                }
                for chunk in embedded_chunks
            ]
            
            # Insert chunks
            supabase.table("note_chunks").insert(chunk_records).execute()
            total_chunks += len(chunk_records)
            print(f"  ✓ {note['title']}: {len(chunk_records)} chunks")
        
        except Exception as e:
            print(f"  ✗ {note['title']}: {str(e)}")
    
    print(f"✅ Total chunks created: {total_chunks}")
    return total_chunks


def perform_search(supabase, user_id: str, query: str):
    """Perform a semantic search."""
    from app.core.embeddings import create_embedding
    
    try:
        # Create embedding for query
        query_embedding = create_embedding(query)
        
        # Search
        result = supabase.rpc(
            "search_note_chunks_by_embedding",
            {
                "query_embedding": query_embedding,
                "user_id": user_id,
                "search_limit": 5
            }
        ).execute()
        
        return result.data or []
    
    except Exception as e:
        print(f"  ❌ Search failed: {str(e)}")
        return []


def display_results(query: str, results: list):
    """Display search results nicely."""
    print(f"\n🔍 Query: \"{query}\"")
    print("─" * 80)
    
    if not results:
        print("  No results found")
        return
    
    for i, result in enumerate(results, 1):
        similarity_pct = result["similarity"] * 100
        print(f"\n  Result {i} (Similarity: {similarity_pct:.1f}%)")
        print(f"  Chunk {result['chunk_index']}/{result['total_chunks']} from note")
        print(f"  Content: {result['content'][:150]}...")
        print()


def get_or_create_test_user(supabase):
    """Get an existing user from the database or prompt for one."""
    print("\n⚠️  No user_id provided. Attempting to find an existing user...")
    
    # Try to get any existing user from profiles
    try:
        result = supabase.table("profiles").select("id").limit(1).execute()
        if result.data:
            user_id = result.data[0]["id"]
            print(f"✅ Found existing user: {user_id}")
            return user_id
    except:
        pass
    
    # If no existing user, provide instructions
    print("\n❌ No existing user found in database.")
    print("\nTo run this script, you need to:")
    print("1. Create a user through your auth system (signup/login)")
    print("2. Copy their user_id (UUID)")
    print("3. Run: python scripts/test_vector_search.py <user_id>")
    print("\nExample:")
    print("  python scripts/test_vector_search.py 550e8400-e29b-41d4-a716-446655440000")
    sys.exit(1)


def main():
    """Main script execution."""
    print("=" * 80)
    print("Vector Embeddings Test Script")
    print("=" * 80)
    
    # Get user_id from command line or find existing
    if len(sys.argv) > 1:
        user_id = sys.argv[1]
        print(f"\nUsing user_id from arguments: {user_id}")
    else:
        # Initialize Supabase and try to find existing user
        supabase = get_supabase_admin()
        user_id = get_or_create_test_user(supabase)
    
    print(f"Test User ID: {user_id}\n")
    
    # Now initialize Supabase again to use the user_id
    supabase = get_supabase_admin()
    
    # Create dummy notes
    notes = create_test_user_and_notes(supabase, user_id)
    
    # Embed notes
    total_chunks = embed_all_notes(supabase, user_id, notes)
    
    # Perform searches
    print(f"\n{'=' * 80}")
    print("Performing Semantic Searches")
    print(f"{'=' * 80}")
    
    for query in TEST_QUERIES:
        results = perform_search(supabase, user_id, query)
        display_results(query, results)
    
    # Summary
    print(f"\n{'=' * 80}")
    print("Summary")
    print(f"{'=' * 80}")
    
    # Verify data was saved
    notes_count = supabase.table("notes").select("id", count="exact").eq("user_id", user_id).execute()
    chunks_count = supabase.table("note_chunks").select("id", count="exact").eq("user_id", user_id).execute()
    
    print(f"\n✅ Test data saved to Supabase:")
    print(f"   - Notes: {len(notes_count.data)}")
    print(f"   - Chunks: {len(chunks_count.data)}")
    print(f"\n💾 Data persisted for future testing")
    print(f"{'=' * 80}")
    print("✅ Test completed successfully!")
    print(f"{'=' * 80}\n")


if __name__ == "__main__":
    main()
