pipeline {
    agent any

    tools {
        nodejs 'Node-24.2.0'
    }

    stages {
        stage('VM Node Version') {
            steps {
                sh '''
                    node -v
                    npm --version
                '''
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm install --no-audit'
            }
        }
        stage('Auditing Dependencies') {
            parallel { 
                stage('NPM Audit') {
                    steps {
                        sh 'npm audit --audit-level=critical'
                    }
                }
                stage('OWASP Dependency Check') {
                    steps {
                        dependencyCheck additionalArguments: '''\
                            --project "solar-system" \
                            --scan . \
                            --format ALL \
                            --prettyPrint
                        ''',
                        odcInstallation: 'OWASP-DepCheck-12'
                        
                        dependencyCheckPublisher failedTotalCritical: 1, pattern: 'dependency-check-report.xml', stopBuild: true
                    }
                }
            }
        }        
    }
}
