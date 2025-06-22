pipeline {
    agent any

    tools {
        nodejs 'Node-24.2.0'
    }

    environment {
        MONGO_URI = "mongodb+srv://daanielmacdonald:0Jc23Yd3tdc04VKY@cluster0.41zdfli.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
        MONGO_DB_USERNAME = credentials('mongo-db-username')
        MONGO_DB_PASSWORD = credentials('mongo-db-password')
        SONAR_SCANNER_HOME = tool 'sonarqube-scanner-710'
    }

    stages {
        stage('VM Node Version') {
            steps {
                sh '''
                    node --version
                    npm --version
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install --no-audit'
            }
        }

        stage('Dependency Scanning') {
            options { timestamps() }
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

        stage('Unit Testing') {
            options { timestamps() }
            steps {
                sh 'npm test'
            }
        }

        stage('Code Coverage') {
            steps {
                catchError(buildResult: 'SUCCESS', message: 'Oops! This will be resolved in future releases', stageResult: 'UNSTABLE') {
                    sh 'npm run coverage'
                }
            }
        }
        stage('SAST - SonarQube-Analysis') {
            steps {
                sh 'echo $SONAR_SCANNER_HOME'
                sh '''
                    $SONAR_SCANNER_HOME/bin/sonar-scanner \
                    -Dsonar.host.url=http://192.168.229.20:9000 \
                    -Dsonar.javascript.lcov.reportPaths=./coverage/lcov.info \
                    -Dsonar.token=sqp_c4903a31079039ee926c28661f1deaa670fba51c \
                    -Dsonar.projectKey=solar-system-project
                '''      
            }
        }
    }

    post {
        always {
            junit allowEmptyResults: true, keepProperties: true, testResults: 'dependency-check-junit.xml'
            junit allowEmptyResults: true, keepProperties: true, testResults: 'test-results.xml'

            publishHTML([
                allowMissing: true, 
                alwaysLinkToLastBuild: true,
                keepAll: true, 
                reportDir: './', 
                reportFiles: 'dependency-check-jenkins.html', 
                reportName: 'Dependency Check HTML Report'
            ])

            publishHTML([
                allowMissing: true, 
                alwaysLinkToLastBuild: true,
                keepAll: true, 
                reportDir: 'coverage/lcov-report', 
                reportFiles: 'index.html', 
                reportName: 'Code Coverage HTML Report'
            ])
        }
    }
}
