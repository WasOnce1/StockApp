pipeline {
    agent any

    environment {
        AWS_ACCOUNT_ID = '879381246843'
        AWS_REGION     = 'ap-south-1' // Change to your AWS region
        ECR_REPO_NAME  = '879381246843.dkr.ecr.ap-south-1.amazonaws.com/my-app'
        IMAGE_TAG      = 'latest'
        GITHUB_URL     = 'https://github.com/WasOnce1/StockApp.git'
        GITHUB_CRED_ID = 'Github-cred-id' // must match exactly in Jenkins credentials
        AWS_CRED_ID    = 'AWS-CRED-ID' // From Jenkins credentials
    }

    stages {
        stage('Checkout from GitHub') {
    steps {
        git(
            branch: 'main',
            url: "${GITHUB_URL}",
            credentialsId: "${GITHUB_CRED_ID}"
        )
    }
}

        stage('Login to AWS ECR') {
            steps {
                withAWS(credentials: "${AWS_CRED_ID}", region: "${AWS_REGION}") {
                    sh """
                    aws ecr get-login-password --region ${AWS_REGION} \
                    | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                    """
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                docker build -t ${ECR_REPO_NAME}:${IMAGE_TAG} .
                docker tag ${ECR_REPO_NAME}:${IMAGE_TAG} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}:${IMAGE_TAG}
                """
            }
        }

        stage('Security Scan') {
            steps {
                sh """
                docker scan ${ECR_REPO_NAME}:${IMAGE_TAG} || true
                """
            }
        }

        stage('Push to ECR') {
            steps {
                sh """
                docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}:${IMAGE_TAG}
                """
            }
        }
    }
}
