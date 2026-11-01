#include <stdio.h>

#define TAILLE 8

// 1. Fonction pour afficher le plateau d'échecs
void afficher_plateau(char plateau[TAILLE][TAILLE]) {
    printf("\n    A   B   C   D   E   F   G   H\n");
    printf("  +-------------------------------+\n");
    
    for (int i = 0; i < TAILLE; i++) {
        // Affichage du numéro de ligne (8 à 1)
        printf("%d |", 8 - i);
        
        for (int j = 0; j < TAILLE; j++) {
            printf(" %c |", plateau[i][j]);
        }
        printf("\n  +-------------------------------+\n");
    }
    printf("    A   B   C   D   E   F   G   H\n\n");
}

// 2. Fonction pour demander les coordonnées du coup au joueur
void demander_coup(int *lig_dep, int *col_dep, int *lig_arr, int *col_arr) {
    char c_dep, c_arr;
    int l_dep, l_arr;

    printf("Entrez votre coup (ex: A1 A4) : ");
    scanf(" %c%d %c%d", &c_dep, &l_dep, &c_arr, &l_arr);

    // Conversion des lettres 'A'-'H' en indices 0-7
    *col_dep = c_dep - 'A';
    *col_arr = c_arr - 'A';

    // Conversion des chiffres 1-8 en indices 0-7
    *lig_dep = 8 - l_dep;
    *lig_arr = 8 - l_arr;
}

// 3. Fonction pour déplacer une pièce sur le plateau
void deplacer_piece(char plateau[TAILLE][TAILLE], int l_dep, int c_dep, int l_arr, int c_arr) {
    // Copie la pièce de la case de départ vers la case d'arrivée
    plateau[l_arr][c_arr] = plateau[l_dep][c_dep];
    // Vide la case de départ
    plateau[l_dep][c_dep] = '.';
}

int main() {
    // Initialisation d'un plateau d'échecs de test avec les 4 pièces demandées
    // Majuscules = Blancs, Minuscules = Noirs, . = Case vide
    char plateau[TAILLE][TAILLE] = {
        {'t', 'c', 'f', 'r', '.', '.', '.', '.'},
        {'.', '.', '.', '.', '.', '.', '.', '.'},
        {'.', '.', '.', '.', '.', '.', '.', '.'},
        {'.', '.', '.', '.', '.', '.', '.', '.'},
        {'.', '.', '.', '.', '.', '.', '.', '.'},
        {'.', '.', '.', '.', '.', '.', '.', '.'},
        {'.', '.', '.', '.', '.', '.', '.', '.'},
        {'T', 'C', 'F', 'R', '.', '.', '.', '.'}
    };

    int l_dep, c_dep, l_arr, c_arr;
    int continuer = 1;

    // Boucle principale pour enchaîner les coups
    while (continuer) {
        // Affichage du plateau
        afficher_plateau(plateau);

        // Saisie des coordonnées du coup par le joueur
        demander_coup(&l_dep, &c_dep, &l_arr, &c_arr);

        // Déplacement effectif de la pièce dans la matrice
        deplacer_piece(plateau, l_dep, c_dep, l_arr, c_arr);

        // Demander si on veut continuer à jouer
        printf("\nVoulez-vous continuer ? (1 : Oui, 0 : Quitter) : ");
        scanf("%d", &continuer);
    }

    printf("\nFin de la partie. Bon courage pour la presentation !\n");
    return 0;
}