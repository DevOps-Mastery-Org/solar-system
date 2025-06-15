pipeline {
    agent any

    stages (
        stage ('VM Node Version') {
            sh '''
                node --version
                npm --version
            '''
        }
    )
}