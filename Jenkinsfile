pipeline {
    agent any

    tools {
        nodejs 'Node-24.2.0'
    }

    environment {
        MONGO_URI = "mongodb+srv://daanielmacdonald:0Jc23Yd3tdc04VKY@cluster0.41zdfli.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
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

                        junit allowEmptyResults: true, keepProperties: true, testResults: 'dependency-check-junit.xml'

                        publishHTML([
                            allowMissing: true, 
                            alwaysLinkToLastBuild: true, 
                            icon: '', 
                            keepAll: true, 
                            reportDir: './', 
                            reportFiles: 'dependency-check-jenkins.html', 
                            reportName: 'Dependency Check HTML Report', 
                            reportTitles: '', 
                            useWrapperFileDirectly: true
                        ])
                    }
                }
            }
        }

        stage('Unit Testing') {
            options { timestamps() }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'mongo-db-creds', 
                    usernameVariable: 'MONGO_USERNAME', 
                    passwordVariable: 'MONGO_PASSWORD'
                )]) {
                    sh 'npm test'
                }

                junit allowEmptyResults: true, keepProperties: true, testResults: 'test-results.xml'
            }
        }
        stage('Code Coverage') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'mongo-db-creds', 
                    usernameVariable: 'MONGO_USERNAME', 
                    passwordVariable: 'MONGO_PASSWORD'
                )]) {
                    catchError(buildResult: 'SUCCESS', message: 'Opps! This will be resolved in fututre releases', stageResult: 'UNSTABLE') {
                        sh 'npm run coverage'
                    }
                }
                publishHTML([
                    allowMissing: true, 
                    alwaysLinkToLastBuild: true, 
                    icon: '', 
                    keepAll: true, 
                    reportDir: 'coverage/Icov-report', 
                    reportFiles: 'index.html', 
                    reportName: 'Code Coverage HTML Report', 
                    reportTitles: '', 
                    useWrapperFileDirectly: true
                ])
            }
        }
    }
}
