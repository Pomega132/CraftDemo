'use strict'

var module = angular.module("Craft", []);

module.controller("Controleur", Controleur);

/**
 * 
 * @param {angular.IScope & ItemsScope} $scope
 * @param {angular.IHttpService} $http
 */
function Controleur($scope, $http)
{
    this.Init = function ()
    {
        $scope.Solvant = {
            Item: null,
            Qty: 0
        };

        $scope.Niveau = 1;
        $scope.Ingredients = [];
        $scope.IngredientsSelected = [];
        $scope.PreVisualisation = null;
        $scope.OpenVollet = false;

        $http.get("Items.json").then(
            function (datas)
            {
                $scope.Ingredients = datas.data;
            }
        );

        $http.get("Recettes.json").then(
            function (datas)
            {
                $scope.Recettes = datas.data;
            }
        );
    }

    $scope.GetIngredients = function ()
    {
        var groupe = {};
    }

    $scope.AddItem = function (ingredient)
    {
        if (ingredient.Solvant) // Solvant
        {
            if ($scope.Solvant.Item) // Déjà avec un solvant
            {
                if ($scope.Solvant.Item.Id == ingredient.Id) // Le même solvant
                {
                    if ($scope.Solvant.Qty < 5)
                        $scope.Solvant.Qty++;
                }
            }
            else
            {
                $scope.Solvant.Item = ingredient;
                $scope.Solvant.Qty = 1;
            }
        }
        else // Item
        {
            var qtyIngredients = $scope.Solvant.Qty * 2;
            if (qtyIngredients > 8)
                qtyIngredients = 8;
            if (qtyIngredients > $scope.IngredientsSelected.length)
            {
                $scope.IngredientsSelected.push(ingredient);
            }
        }
    }

    $scope.RemoveSolvant = function ()
    {
        if ($scope.Solvant.Qty > 0)
            $scope.Solvant.Qty--;

        if ($scope.Solvant.Qty < $scope.IngredientsSelected.length)
            $scope.IngredientsSelected.splice($scope.Solvant.Qty * 2, 2);

        if ($scope.Solvant.Qty == 0)
            $scope.Solvant.Item = null;
    }

    $scope.RemoveItem = function (index)
    {
        $scope.IngredientsSelected.splice(index, 1);
    }

    $scope.GetRecepeImage = function ()
    {
        var recette = CompareIngredients();

        if (recette && recette.Connue)
            return recette.Image;
        else
            return "Img/Defaults/12016.png";
    }

    $scope.GetCraftChance = function ()
    {
        var recette = CompareIngredients();

        if (recette && recette.Connue)
            return CalculeChance($scope.Niveau, recette.Difficulte);
        else
            return "??";
    }

    $scope.GetCornerRarity = function (item)
    {
        if (item)
            return `Corner${item.Rarity}`;
    }

    $scope.GetResultatCornerColor = function ()
    {
        if ($scope.IngredientsSelected[1] != undefined)
        {
            var recette = CompareIngredients();

            if (recette && recette.Connue)
                return `Corner${recette.Rarity}`;
            else
                return "CornerUnknow";
        }
    }

    function CompareIngredients()
    {
        if ($scope.Recettes)
        {
            var ingredients = angular.copy($scope.IngredientsSelected).sort((a, b) => a.Id - b.Id);

            for (var recette of $scope.Recettes)
            {
                var find = recette.IngredientsIds.length == ingredients.length;
                var recetteIngredients = recette.IngredientsIds.sort();

                for (var i = 0; i < ingredients.length; i++)
                {
                    if (ingredients[i].Id != recetteIngredients[i])
                        find = false;
                }

                if (find)
                    return recette;
            }
        }

        return false;
    }

    function CalculeChance(niveau, difficulte)
    {
        var resultat = 5 * (niveau - difficulte) + 50;

        if (resultat < 0)
            return 0;
        else if (resultat > 100)
            return 100;
        else
            return resultat;
    }
}